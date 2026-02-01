-- Add DELETE policy for conversations to allow users to delete their own conversations
CREATE POLICY "Users can delete their own conversations"
ON public.conversations
FOR DELETE
USING (auth.uid() = adopter_id OR auth.uid() = publisher_id);

-- Add DELETE policy for messages to allow deleting messages from user's conversations
CREATE POLICY "Users can delete messages in their conversations"
ON public.messages
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM conversations
    WHERE conversations.id = messages.conversation_id
    AND (conversations.adopter_id = auth.uid() OR conversations.publisher_id = auth.uid())
  )
);