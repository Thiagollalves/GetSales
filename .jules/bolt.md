## 2024-09-02 - Prevent O(N) re-renders in Chat Message List
**Learning:** In chat interfaces, using uncontrolled inputs or updating input state at the top level of a chat window component causes re-renders of the entire message history on every keystroke. Since the message list scales linearly (O(N)), this can cause noticeable typing lag for long conversations.
**Action:** Always wrap `MessageBubble` (or equivalent list items in chat/feeds) with `React.memo` when the parent component holds rapidly updating state like text inputs, or decouple the input state from the message list completely.
