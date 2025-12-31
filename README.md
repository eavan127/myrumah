<p align="center">
  <img src="https://img.shields.io/badge/Expo-54.0-000020?style=for-the-badge&logo=expo&logoColor=white" alt="Expo"/>
  <img src="https://img.shields.io/badge/React%20Native-0.81-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React Native"/>
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/Three.js-r182-000000?style=for-the-badge&logo=three.js&logoColor=white" alt="Three.js"/>
  <img src="https://img.shields.io/badge/Google%20Gemini-AI-4285F4?style=for-the-badge&logo=google&logoColor=white" alt="Gemini AI"/>
</p>

# 🏠 MyRumah

> **Revolutionizing Home Design with AI & AR** — A next-generation mobile marketplace that combines e-commerce with cutting-edge AI-powered interior design tools and immersive 3D visualization.

---

## 📋 Table of Contents

- [Executive Summary](#-executive-summary)
- [Business Value Proposition](#-business-value-proposition)
- [Key Features](#-key-features)
- [Technology Architecture](#-technology-architecture)
- [Technical Stack](#-technical-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Core Modules Deep Dive](#-core-modules-deep-dive)
- [API Integration](#-api-integration)
- [Security & Authentication](#-security--authentication)
- [Deployment](#-deployment)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [License](#-license)

---

## 📊 Executive Summary

**MyRumah** is a B2C and B2B2C mobile application that bridges the gap between furniture shopping and interior design. By leveraging **Google Gemini AI** for intelligent room redesign and **Three.js/React Three Fiber** for real-time 3D visualization, Room+ enables users to:

- 🛋️ Browse and purchase furniture from multiple merchants
- 🎨 Redesign rooms using AI-generated concepts
- 📐 Visualize furniture in 3D before purchasing
- 🏪 Operate as a merchant and manage product listings

### Target Market
| Segment | Description |
|---------|-------------|
| **B2C** | Homeowners, renters, and design enthusiasts seeking inspiration |
| **B2B2C** | Furniture retailers and designers wanting to reach customers |
| **Enterprise** | Real estate developers showcasing furnished units |

---

## 💼 Business Value Proposition

### For Consumers
- **Reduce Purchase Anxiety** — See exactly how furniture fits your space before buying
- **AI-Powered Inspiration** — Generate professional design concepts in seconds
- **Streamlined Shopping** — Multi-merchant cart with unified checkout

### For Merchants
- **Lower Return Rates** — 3D visualization reduces size/fit-related returns by up to 40%
- **Increased Conversion** — AR try-before-buy increases purchase confidence
- **Analytics Dashboard** — Track product performance and customer engagement

### Revenue Model
```
┌─────────────────────────────────────────────────────────────┐
│  Commission on Sales (5-15%)                                │
│  Premium AI Features (Subscription)                         │
│  Featured Listings & Advertising                            │
│  Enterprise API Access                                      │
└─────────────────────────────────────────────────────────────┘
```

---

## ✨ Key Features

### 🏪 E-Commerce Platform
- **Product Catalog** — Browse furniture by category (Chair, Table, Lighting, Decor)
- **Merchant Storefronts** — Multi-vendor marketplace with individual store pages
- **Smart Cart** — Group items by merchant, apply vouchers, multiple payment methods
- **Checkout Flow** — Support for cards (Visa/Mastercard), e-wallets (TnG, GrabPay, ShopeePay), FPX

### 🎨 Seasoning Studio (AI/AR Tools)

| Tool | Description | Technology |
|------|-------------|------------|
| **AI Architect** | Upload room photos and get AI-generated redesign concepts | Google Gemini 2.5 Flash |
| **Virtual Place** | Drag & drop 3D furniture models into a virtual room | Three.js + React Three Fiber |
| **Scene Scanner** | Digitize your physical room (coming soon) | Expo Camera |
| **Magic Eraser** | Remove unwanted objects from room photos | AI Image Processing |
| **Manpower Design** | Connect with professional interior designers | Marketplace |

### 👤 User Management
- **Role-Based Access** — Consumer vs. Merchant experiences
- **Personalized Home** — Dynamic UI based on user role
- **Profile Management** — View orders, saved items, settings

---

## 🏗️ Technology Architecture

### High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                    │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                     Expo + React Native App                          │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │   │
│  │  │  Season  │ │ Seasoning│ │Community │ │   Cart   │ │ Profile  │  │   │
│  │  │  (Home)  │ │  Studio  │ │   Hub    │ │   Flow   │ │  Mgmt    │  │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            SERVICE LAYER                                     │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────────┐ │
│  │  Auth Context   │  │  Cart Context   │  │     Product Service         │ │
│  │  (Role-based)   │  │  (State Mgmt)   │  │  (CRUD + Merchant Filter)   │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          EXTERNAL SERVICES                                   │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────────┐ │
│  │  Google Gemini  │  │   Three.js /    │  │      Expo Services          │ │
│  │   AI (2.5 Flash)│  │ React 3 Fiber   │  │  (Camera, FileSystem, etc.) │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Data Flow Architecture

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│    User      │───▶│   Screen     │───▶│   Context    │───▶│   Service    │
│  Interaction │    │  Component   │    │   Provider   │    │    Layer     │
└──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘
                           │                    │                   │
                           ▼                    ▼                   ▼
                    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
                    │    State     │◀───│   Actions    │◀───│  API/Mock    │
                    │    Update    │    │   Dispatch   │    │    Data      │
                    └──────────────┘    └──────────────┘    └──────────────┘
```

### Navigation Architecture (Expo Router)

```
app/
├── _layout.tsx              # Root: AuthProvider + CartProvider + Theme
├── (tabs)/                  # Tab Navigator
│   ├── _layout.tsx          # Tab configuration
│   ├── index.tsx            # Season (Home) - Dynamic: User/Merchant
│   ├── kreativ.tsx          # Seasoning Hub
│   ├── community.tsx        # Community Feed
│   ├── cart.tsx             # Shopping Cart
│   └── profile.tsx          # User Profile
├── auth/
│   └── login.tsx            # Authentication Screen
├── kreativ/                 # AI/AR Features (Stack)
│   ├── ai-design.tsx        # AI Architect
│   ├── place.tsx            # 3D Virtual Place
│   ├── scan.tsx             # Scene Scanner
│   ├── eraser.tsx           # Magic Eraser
│   └── hire.tsx             # Designer Marketplace
├── product/
│   └── [id].tsx             # Product Detail (Dynamic Route)
├── store/
│   ├── index.tsx            # Store Listing
│   └── [id].tsx             # Store Detail (Dynamic Route)
├── merchant/
│   └── upload.tsx           # Product Upload (Merchant Only)
└── checkout.tsx             # Checkout Flow
```

---

## 🛠️ Technical Stack

### Frontend Framework
| Technology | Version | Purpose |
|------------|---------|---------|
| **Expo** | 54.0.29 | Cross-platform development framework |
| **React Native** | 0.81.5 | Native mobile UI |
| **React** | 19.1.0 | Component architecture |
| **TypeScript** | 5.9.2 | Type safety |
| **Expo Router** | 6.0.19 | File-based routing |

### 3D & Graphics
| Technology | Version | Purpose |
|------------|---------|---------|
| **Three.js** | 0.182.0 | 3D rendering engine |
| **React Three Fiber** | 9.4.2 | React renderer for Three.js |
| **@react-three/drei** | 10.7.7 | Useful helpers for R3F |
| **Expo GL** | 16.0.9 | OpenGL context for Expo |

### AI & Machine Learning
| Technology | Purpose |
|------------|---------|
| **Google Gemini 2.5 Flash** | Multimodal AI for image analysis & generation |
| **@google/genai** | Official Google AI SDK |

### Navigation & UI
| Technology | Purpose |
|------------|---------|
| **React Navigation** | Navigation infrastructure |
| **React Native Reanimated** | High-performance animations |
| **React Native Gesture Handler** | Touch & gesture handling |
| **React Native Safe Area Context** | Safe area handling |

### Media & Assets
| Technology | Purpose |
|------------|---------|
| **Expo Image Picker** | Camera/gallery access |
| **Expo File System** | Local file operations |
| **Expo Camera** | Camera functionality |
| **Expo Sharing** | Share content externally |

---

## 📁 Project Structure

```
Room+/
├── app/                          # 📱 Screens (Expo Router)
│   ├── _layout.tsx               # Root layout with providers
│   ├── (tabs)/                   # Tab-based navigation
│   ├── auth/                     # Authentication flows
│   ├── kreativ/                  # AI/AR feature screens
│   ├── merchant/                 # Merchant-specific screens
│   ├── product/                  # Product views
│   └── store/                    # Store views
│
├── components/                   # 🧩 Reusable Components
│   ├── AuthContext.tsx           # Authentication state management
│   ├── UserHome.tsx              # Consumer home view
│   ├── MerchantDashboard.tsx     # Merchant home view
│   ├── Themed.tsx                # Theme-aware components
│   └── __tests__/                # Component tests
│
├── context/                      # 🔄 State Management
│   └── CartContext.tsx           # Shopping cart state
│
├── services/                     # 🔌 Business Logic & API
│   ├── product.ts                # Product CRUD operations
│   └── merchant.ts               # Merchant operations
│
├── assets/                       # 📦 Static Assets
│   ├── fonts/                    # Custom typography
│   ├── Icon/                     # Payment & brand icons
│   ├── images/                   # UI images
│   └── models/                   # 3D model files (.obj)
│
├── constants/                    # ⚙️ Configuration
│   └── Colors.ts                 # Theme colors
│
└── Configuration Files
    ├── app.json                  # Expo configuration
    ├── tsconfig.json             # TypeScript config
    ├── babel.config.js           # Babel configuration
    └── metro.config.js           # Metro bundler config
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18.x or later
- **npm** 9.x or **yarn** 1.22.x
- **Expo CLI** (`npm install -g expo-cli`)
- **Expo Go** app on iOS/Android (for development)

### Environment Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/kimhongzhang323/Room-.git
   cd Room-
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   Create a `.env` file in the root directory:
   ```env
   EXPO_PUBLIC_GEMINI_API_KEY=your_google_gemini_api_key
   ```

4. **Start the development server**
   ```bash
   # Start Expo development server
   npm start

   # Or run on specific platform
   npm run ios      # iOS Simulator
   npm run android  # Android Emulator
   npm run web      # Web Browser
   ```

### Development Commands

| Command | Description |
|---------|-------------|
| `npm start` | Start Expo dev server |
| `npm run ios` | Run on iOS simulator |
| `npm run android` | Run on Android emulator |
| `npm run web` | Run in web browser |

---

## 🔍 Core Modules Deep Dive

### 1. AI Architect Module

**Location:** `app/kreativ/ai-design.tsx`

The AI Architect leverages Google's Gemini 2.5 Flash model for multimodal understanding. Users can:

- Upload room photos from gallery or select from saved rooms
- Send text prompts describing desired changes
- Receive AI-generated redesign suggestions with product recommendations

**Key Implementation:**
```typescript
// Gemini AI Integration
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-image",
    contents: [
        { text: "Redesign this room" },
        { inlineData: { mimeType: 'image/jpeg', data: base64Image }}
    ]
});
```

### 2. Virtual Place (3D Visualization)

**Location:** `app/kreativ/place.tsx`

Real-time 3D room visualization using React Three Fiber:

- Load OBJ models for furniture
- Orbit controls for camera manipulation
- Drag & drop furniture placement
- Billboard rendering for product cards

**Key Implementation:**
```typescript
// 3D Model Loading
function FurnitureModel({ item, isSelected, onClick }) {
    const obj = useLoader(OBJLoader, modelAsset.uri);
    
    return (
        <group position={[item.x, 0, item.z]} rotation={[0, item.rotation, 0]}>
            <primitive object={obj.clone()} scale={0.05} />
        </group>
    );
}
```

### 3. Shopping Cart System

**Location:** `context/CartContext.tsx`

Context-based state management for cart operations:

- Add/remove items
- Quantity management
- Multi-merchant grouping
- Real-time total calculation

---

## 🔐 Security & Authentication

### Authentication Flow

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│    Login     │────▶│    Auth      │────▶│   Protected  │
│    Screen    │     │   Context    │     │    Routes    │
└──────────────┘     └──────────────┘     └──────────────┘
       │                    │                     │
       ▼                    ▼                     ▼
  Role Selection       Store User           Route Guard
  (User/Merchant)      Session             (Auto-redirect)
```

### Role-Based Access Control

| Role | Access Level |
|------|--------------|
| **Guest** | Browse products, view stores |
| **User** | Full shopping, AI tools, cart, checkout |
| **Merchant** | Product management, sales dashboard |

---

## 📦 Deployment

### Build for Production

```bash
# Build for all platforms
npx expo build

# Build for specific platform
npx expo build:ios
npx expo build:android
```

### EAS Build (Recommended)

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure project
eas build:configure

# Build
eas build --platform all
```

---

## 🗺️ Roadmap

### Phase 1: MVP (Current)
- [x] E-commerce marketplace
- [x] AI room redesign
- [x] 3D furniture visualization
- [x] Multi-merchant cart
- [x] Role-based authentication

### Phase 2: Enhancement (Q1 2026)
- [ ] Backend integration (Firebase/Supabase)
- [ ] Real payment processing (Stripe)
- [ ] AR room scanning with LiDAR
- [ ] Social features (share designs)

### Phase 3: Scale (Q2 2026)
- [ ] Machine learning recommendations
- [ ] Merchant analytics dashboard
- [ ] API for third-party integrations
- [ ] Enterprise white-label solution

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Style

- Use TypeScript for all new files
- Follow ESLint configuration
- Write meaningful commit messages
- Add tests for new features

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📞 Contact

**Project Maintainer:** Kim Hong Zhang  
**Repository:** [github.com/kimhongzhang323/Room-](https://github.com/kimhongzhang323/Room-)

---

<p align="center">
  Made with ❤️ using Expo, React Native, and AI
</p>

