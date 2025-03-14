# MongoDB POC

## API

```sh
# Set the base URL
export API_URL=http://localhost:8080

# Healthz check without DB connection
curl -v $API_URL/healthz

# Healthz check with DB connection
curl -v $API_URL/healthz/db

# Get current value
curl $API_URL/value

# Increment counter
curl -X POST $API_URL/increment

# Clear counter
curl -X DELETE $API_URL/clear
```

## Environment variables

```env
PORT=8080
MONGODB_URI=""
```
