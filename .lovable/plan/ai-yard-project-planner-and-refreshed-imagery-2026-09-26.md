# AI yard project planner and refreshed imagery

## Build

- Add a dedicated “Plan My Yard” page and navigation entry where prospective customers describe their yard, goals, constraints, and upload one photo.
- Send the validated description and photo securely from the server to Lovable AI Gateway using the default multimodal model.
- Return a tailored, clearly structured project brief with priorities, recommended services, practical next steps, and a prominent quote-request action.
- Include upload preview, file type/size validation, progress, retry-ready error messages, and a reset/start-over state.

## Imagery refresh

- Host the seven newly supplied landscaping images as project assets.
- Assign them to appropriate services and page sections so the site no longer repeats the same few photos.
- Keep the existing video introduction and preserve the current earthy visual direction.

## Technical details

- Keep AI credentials and prompts server-side in a streaming TanStack API route; send the photo only for the active request and do not store it.
- Validate text and image input in both the page and server route, including image MIME type and size limits.
- Use `openai/gpt-6-astra` through the Responses API with image input and visible streamed progress/output.
- Add unique metadata for the new public page, then verify generation, errors, navigation, image loading, and mobile/desktop layouts.
