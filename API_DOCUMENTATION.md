# Campus Forum REST API Documentation

Base URL: `http://127.0.0.1:8000/api/`

## Authentication

### Get JWT Token
**POST** `/api/token/`
```json
{
  "username": "your_username",
  "password": "your_password"
}
```
Response:
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

### Refresh Token
**POST** `/api/token/refresh/`
```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

### Using Token
Add header to all authenticated requests:
```
Authorization: Bearer <access_token>
```

---

## Categories

### List Categories
**GET** `/api/categories/`

### Get Category
**GET** `/api/categories/{id}/`

---

## Tags

### List Tags
**GET** `/api/tags/`

### Get Tag
**GET** `/api/tags/{id}/`

---

## Questions

### List Questions
**GET** `/api/questions/`

Query Parameters:
- `search` - Search in title/content
- `category` - Filter by category ID
- `tag` - Filter by tag ID
- `sort` - Sort by 'newest' or 'answers'
- `page` - Page number

### Get Question
**GET** `/api/questions/{id}/`

### Create Question
**POST** `/api/questions/`
```json
{
  "title": "How to use Django?",
  "content": "I need help with Django...",
  "category": 1,
  "tags": ["python", "django"],
  "image": null
}
```

### Update Question
**PUT/PATCH** `/api/questions/{id}/`

### Delete Question
**DELETE** `/api/questions/{id}/`

### Upvote Question
**POST** `/api/questions/{id}/upvote/`

### Downvote Question
**POST** `/api/questions/{id}/downvote/`

---

## Answers

### List Answers
**GET** `/api/answers/`

### Get Answer
**GET** `/api/answers/{id}/`

### Create Answer
**POST** `/api/answers/`
```json
{
  "question": 1,
  "content": "Here's how you do it..."
}
```

### Update Answer
**PUT/PATCH** `/api/answers/{id}/`

### Delete Answer
**DELETE** `/api/answers/{id}/`

### Upvote Answer
**POST** `/api/answers/{id}/upvote/`

### Downvote Answer
**POST** `/api/answers/{id}/downvote/`

### Mark Best Answer
**POST** `/api/answers/{id}/mark_best/`

---

## Achievements

### List Achievements
**GET** `/api/achievements/`

### Get Achievement
**GET** `/api/achievements/{id}/`

### Create Achievement
**POST** `/api/achievements/`
```json
{
  "title": "Won Hackathon",
  "description": "First place at XYZ Hackathon",
  "achievement_type": "hackathon",
  "date_achieved": "2024-01-15",
  "image": null
}
```

### Update Achievement
**PUT/PATCH** `/api/achievements/{id}/`

### Delete Achievement
**DELETE** `/api/achievements/{id}/`

---

## User Profiles

### List Profiles
**GET** `/api/profiles/`

### Get Profile by Username
**GET** `/api/profiles/{username}/`

### Get Current User Profile
**GET** `/api/profiles/me/`

### Update Current User Profile
**PUT** `/api/profiles/me/`
```json
{
  "bio": "Computer Science student..."
}
```

---

## Response Format

### Success Response
```json
{
  "count": 10,
  "next": "http://127.0.0.1:8000/api/questions/?page=2",
  "previous": null,
  "results": [...]
}
```

### Error Response
```json
{
  "detail": "Error message"
}
```

---

## Example Usage (JavaScript)

```javascript
// Get token
const response = await fetch('http://127.0.0.1:8000/api/token/', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'admin', password: 'admin123' })
});
const { access } = await response.json();

// Get questions
const questions = await fetch('http://127.0.0.1:8000/api/questions/', {
  headers: { 'Authorization': `Bearer ${access}` }
});

// Create question
const newQuestion = await fetch('http://127.0.0.1:8000/api/questions/', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${access}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: 'My Question',
    content: 'Question content...',
    category: 1,
    tags: ['python']
  })
});
```

---

## Testing with cURL

```bash
# Get token
curl -X POST http://127.0.0.1:8000/api/token/ \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# List questions
curl http://127.0.0.1:8000/api/questions/ \
  -H "Authorization: Bearer <your_token>"

# Create question
curl -X POST http://127.0.0.1:8000/api/questions/ \
  -H "Authorization: Bearer <your_token>" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","content":"Content","category":1}'
```
