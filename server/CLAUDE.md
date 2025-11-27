# Backend

## Libraries Used

- AI SDK: https://ai-sdk.dev/llms.txt
- Anthropic Claude API (via @ai-sdk/anthropic)

## Database Access

The PostgreSQL database runs in a Docker container. To access it for research or debugging:

```bash
# Check the table structure
docker exec -u postgres anise_postgres psql -U anise_user -d anise_db -c "\d table_name"

# Query data
docker exec -u postgres anise_postgres psql -U anise_user -d anise_db -c "SELECT * FROM table_name LIMIT 10;"

# Interactive psql session
docker exec -it -u postgres anise_postgres psql -U anise_user -d anise_db
```

**Database credentials:**
- User: `anise_user`
- Database: `anise_db`
- Container: `anise_postgres`
