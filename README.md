# INF2003 Unified Supplier Ordering and Inventory Management Platform (USOIMP) 4 Team 66
This user manual explains how to run the USOIMP under three different environments:
- **Option A** - Hosted Online (no setup needed)
- **Option B** - Hybrid (Local frontend + backend using AWS RDS and MongoDB Atlas)

## Option A - Hosted Online
### Access Links
- Frontend (Vercel):
  - https://usoimp-usoimp.vercel.app/
- Backend (Render):
  - https://usoimp-backend.onrender.com
  
### How to Use:
1. Open the Frontend URL.
2. Begin using the system, all backend operations connect to:
   - Amazon RDS (MySQL)
   - MongoDB Atlas
- Note: Free tiers on Vercel/Render may sleep or take a few seconds to wake up if inactive, which can cause temporary loading delays. 

## Option B - Hybrid
1. **Clone Repository** 
2. **Setup**
	1. Run ``` npm i ``` to install the dependencies
	2. Run backend and frontend locally (seperate terminals)
		```
		cd backend 
		npm run dev
		cd frontend
		npm run dev
		```
3. **Run**
   1. http://localhost:5173/
   2. Cloud-based environment variables (RDS + MongoDB Atlas) are already configured in both backend and frontend.
   3. No additional configuration is required unless using full local setup
      
## Database Access
### 1. MySQL (AWS RDS)
- **Host:** usoimp-db.cpgiqai44p3k.ap-southeast-1.rds.amazonaws.com  
- **Port:** 3306  
- **Database:** usoimpdb  
- **Username:** admin  
- **Password:** usoimp123  

### 2. MongoDB (MongoDB Atlas/Compass)
- **Connection URI:**  
  `mongodb+srv://admin:rXiEbFRsXck7TwkJ@usoimpnosql.lstx9i7.mongodb.net/?appName=usoimpnosql`
- **Primary Database:** usoimp
- **Access:** IP whitelist includes 0.0.0.0/0.
- **Notes:** Public access is enabled for grading.




