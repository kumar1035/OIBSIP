from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from sqlalchemy.orm import selectinload
from app.database import get_db
from app.models.chat import ChatSession, ChatMessage
from app.models.user import User
from app.schemas.chat import MessageCreate, ChatResponse, SessionResponse, SessionWithMessages
from app.services.ai_service import get_ai_response
from app.routers.auth import get_current_user

router = APIRouter(prefix="/api/chat", tags=["chat"])


@router.post("/message", response_model=ChatResponse)
async def send_message(
    data: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Get or create session
    if data.session_id:
        result = await db.execute(
            select(ChatSession).where(
                ChatSession.id == data.session_id,
                ChatSession.user_id == current_user.id,
            )
        )
        session = result.scalar_one_or_none()
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
    else:
        session = ChatSession(user_id=current_user.id, title=data.content[:60])
        db.add(session)
        await db.flush()

    # Load conversation history for AI context
    result = await db.execute(
        select(ChatMessage)
        .where(ChatMessage.session_id == session.id)
        .order_by(ChatMessage.created_at)
    )
    history = result.scalars().all()

    messages = [{"role": m.role, "content": m.content} for m in history]
    messages.append({"role": "user", "content": data.content})

    try:
        ai_text = await get_ai_response(messages)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI service error: {str(e)}")

    # Save both messages and update session timestamp
    user_msg = ChatMessage(session_id=session.id, role="user", content=data.content)
    assistant_msg = ChatMessage(session_id=session.id, role="assistant", content=ai_text)
    session.updated_at = datetime.now(timezone.utc)

    db.add(user_msg)
    db.add(assistant_msg)
    await db.commit()
    await db.refresh(user_msg)
    await db.refresh(assistant_msg)

    return ChatResponse(
        session_id=session.id,
        user_message=user_msg,
        assistant_message=assistant_msg,
    )


@router.get("/sessions", response_model=list[SessionResponse])
async def get_sessions(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(ChatSession)
        .where(ChatSession.user_id == current_user.id)
        .order_by(desc(ChatSession.updated_at))
    )
    return result.scalars().all()


@router.get("/sessions/{session_id}", response_model=SessionWithMessages)
async def get_session(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(ChatSession)
        .options(selectinload(ChatSession.messages))
        .where(ChatSession.id == session_id, ChatSession.user_id == current_user.id)
    )
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session


@router.delete("/sessions/{session_id}")
async def delete_session(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(ChatSession).where(
            ChatSession.id == session_id,
            ChatSession.user_id == current_user.id,
        )
    )
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    await db.delete(session)
    await db.commit()
    return {"message": "Session deleted"}
