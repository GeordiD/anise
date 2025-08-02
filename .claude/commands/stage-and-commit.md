Stage all uncommitted files and commit them using git.
When making a commit message, follow these guidelines:

- Your commit message should represent the changes being committed and the context of the task you're working on
- Commit messages should be as short as possible. Aim for 3-8 words, though you can use more when you need to explain better.
- The message should be detailed and not vague (while still being brief)
- The message should convey the overall direction of the changeset, not listing out file by file
- If you're working from a plan, look at your task names / phase names for inspiration.
- Reference the user given context (below) when making your message. It might include good context about the state of what we're working on
  - Sometimes we want to commit something that's WIP and will need a lot of edits
  - Other times we've really refined the changeset and are locking in this code.
  - Unless otherwise specified, it's safe to assume the changes are more permanent.

Good examples:

- 'Phase 1: Added endpoint'
- 'Install and setup database'
- 'Initial implementation of user management feature'

User Given Context: "$ARGUMENTS"
