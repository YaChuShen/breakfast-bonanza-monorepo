![Image](https://github.com/user-attachments/assets/1a7f3ebc-f6b9-4f9a-9867-ee889024d650)

A fast-paced multiplayer breakfast cooking game built with modern full-stack architecture. Players race against time to prepare breakfast orders while competing on a global leaderboard.

Live Demo [https://game-angp-nzi6zijkq-annshens-projects.vercel.app](https://game-angp-nzi6zijkq-annshens-projects.vercel.app/?utm_source=readme) 

## 🍳 System Features
### Scalable Monorepo Architecture
Designed with Turborepo monorepo architecture featuring three independently deployable services:

- **Web App (breakfast-bonanza-web)**: Next.js frontend with SSR capabilities
- **GraphQL API (breakfast-bonanza-api)**: Express-based API server handling authentication, scores, and leaderboard
- **Socket.IO Server (breakfast-bonanza-socket-server)**: Real-time WebSocket server for multiplayer gameplay
  
This modular design enables horizontal scaling of real-time servers without impacting the main application or API layers.


### Backend Services Architecture
/放圖

## 🛠️ Tech Stack
- **Frontend**: Next.js, React, Chakra UI, Framer Motion
- **State Management**: Redux Toolkit
- **Authentication**: NextAuth.js
- **Database**: Supabase (PostgreSQL)
- **Analytics**: Mixpanel
- **Authentication**: JWT (jsonwebtoken) + bcrypt
- **Styling**: Chakra UI, Emotion
  
## 👥 Two Player Mode
/放圖

## 🖌️ Global Leaderboard
- **Top 5 leaderboard**: Maintained via PostgreSQL stored procedure maintain_top5_leaderboard
- **Automatic score updates**: Atomic transactions ensure data consistency
- **GraphQL queries**: Efficient data fetching with indexed database queries

## 👤 User Authentication
- **Email/Password**: bcrypt-hashed credentials stored in Supabase
- **Google OAuth**: NextAuth.js integration for social login
- **JWT tokens**: Stateless authentication with 3-day expiration
- **Row Level Security**: Supabase RLS policies protecting user data
  
## 🎯 Gameplay
- **Real-Time Cooking Mechanics**: Utilize intuitive drag-and-drop actions for quick and easy learning
- **Simultaneous Order Management**: Handle multiple customer orders concurrently without burning food, adding strategic depth and time pressure to gameplay.
- **Variety of Breakfast Combinations**: Master multiple dishes including eggs, toast, bacon, and beverages while managing customer orders efficiently
- **Leaderboard integration**: Real-time ranking updates via GraphQL mutations.
- **Two Difficulty Levels**: unlock Level 2 to earn the “Eggcellent Chef” title
- **Simultaneous Order Management**: Handle multiple orders without burning food, adding excitement and complexity.

## 📊 Database Optimization 
- **Stored procedures**: Atomic score updates with add_score_and_update_stats RPC
- **Indexing strategy**: Optimized queries on user_id, score, and timestamps
- **Row Level Security**: Supabase RLS policies for data protection

## 👩‍💻 Author

**Serene Shen**
yazu0419@gmail.com

