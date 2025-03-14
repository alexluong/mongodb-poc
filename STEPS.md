# init CLI setup

# 1. Login
gcloud auth login

# 2. Project ID
gcloud config set project PROJECT_ID

# ---

# deploy

export PROJECT_ID=$(gcloud config get-value project)
export REGION=asia-southeast1
export MONGODB_URI="MONGODB_URI"

# 1. Verify your project setup
gcloud config get-value project
gcloud auth list   # Check if you're authenticated

# 2. Enable required APIs (one-time setup)
gcloud services enable \
  run.googleapis.com \
  containerregistry.googleapis.com \
  compute.googleapis.com \
  vpcaccess.googleapis.com

# 3. Configure Docker to use GCP's Container Registry
gcloud auth configure-docker

# 4. Build and tag image
docker build --platform linux/amd64 \
  --target production \
  -t gcr.io/$PROJECT_ID/counter-app .

# 5. Push to Container Registry
docker push gcr.io/$PROJECT_ID/counter-app

# 6. Deploy to Cloud Run
gcloud run deploy counter-app \
  --image gcr.io/$PROJECT_ID/counter-app \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --set-env-vars="MONGODB_URI=$MONGODB_URI"
  
# ---

# network

# 1. Create VPC network
gcloud compute networks create poc-vpc \
  --subnet-mode=custom

# 2. Create subnet
gcloud compute networks subnets create poc-subnet \
  --network=poc-vpc \
  --region=$REGION \
  --range=10.1.0.0/24

# 3. Create router
gcloud compute routers create poc-router \
  --network=poc-vpc \
  --region=$REGION

# 4. Create static IP for NAT
gcloud compute addresses create poc-nat-ip \
  --region=$REGION

# 5. Create Cloud NAT with static IP
gcloud compute routers nats create poc-nat \
  --router=poc-router \
  --region=$REGION \
  --nat-custom-subnet-ip-ranges=poc-subnet \
  --nat-external-ip-pool=poc-nat-ip

# 6. Get NAT IP to whitelist
gcloud compute addresses describe poc-nat-ip \
  --region=$REGION \
  --format="get(address)"

# 7. Deploy Cloud Run with all traffic through VPC
gcloud run deploy counter-app \
  --image gcr.io/$PROJECT_ID/counter-app \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --set-env-vars="MONGODB_URI=$MONGODB_URI" \
  --network=poc-vpc \
  --subnet=poc-subnet \
  --vpc-egress=all-traffic


# ---

# cleanup

# Delete Cloud Run services
gcloud run services delete ip-test --region=$REGION --quiet
gcloud run services delete counter-app --region=$REGION --quiet

# Delete Cloud NAT and its IP (most expensive part)
gcloud compute routers nats delete poc-nat \
  --router=poc-router \
  --region=$REGION \
  --quiet

gcloud compute addresses delete poc-nat-ip \
  --region=$REGION \
  --quiet
  
# Optional
# These are free, but if you want to delete:
gcloud compute routers delete poc-router \
  --region=$REGION \
  --quiet

gcloud compute networks subnets delete poc-subnet \
  --region=$REGION \
  --quiet

gcloud compute networks delete poc-vpc --quiet

# Optional
# Container images
gcloud container images delete gcr.io/$PROJECT_ID/ip-test --quiet --force-delete-tags
gcloud container images delete gcr.io/$PROJECT_ID/counter-app --quiet --force-delete-tags
