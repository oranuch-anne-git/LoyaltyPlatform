# Loyalty Platform Specification
*(Reference: Buzzebees-style Loyalty Platform)*

---

## 1. High-Level Architecture (Conceptual)

### Architecture Overview
The Loyalty Platform is designed as a modular, service-oriented system with LINE Official Account as the primary customer interaction channel.

```text
[ End Users ]
     |
 LINE OA / Web / Mobile
     |
[ Loyalty Platform ]
 ├─ Member Service
 ├─ Point Engine
 ├─ Reward & Privilege Service
 ├─ Campaign Engine
 ├─ Notification Service
 ├─ Analytics & Reporting
 └─ Admin Portal
     |
[ Partner Systems / Branch / POS ]
```

### Key Architecture Principles
- Omni-channel with LINE OA as the primary channel
- API-first and service-based design
- Scalable and cloud-ready architecture
- Secure integration with partner and POS systems

---

## 2. Functional Requirements for LINE OA

### 2.1 Member & Identity Management
- Member registration and login via **LINE Official Account, Web, or Mobile App**
- Account linking with **LINE ID**
- Member profile management
- Transaction and redemption history
- **Single Member ID** across multiple channels

---

### 2.2 Point & Reward Engine
- Earn points from purchases and campaigns
- **Real-time point calculation**
- Point expiration rules
- Point redemption for discounts, services, and privileges

---

### 2.3 Reward & Privilege Catalog
- Centralized reward catalog
- Category-based browsing
- Partner privilege support
- Quantity and validity control

---

### 2.4 Promotion & Campaign Management
- Discount, cashback, and redemption campaigns
- Campaign conditions by time, segment, and branch
- Banner and carousel management

---

### 2.5 Branch & Service Integration
- Branch locator
- Branch-specific promotions
- Service-based rewards

---

### 2.6 Omni-Channel Experience (LINE OA First)
- LINE Official Account as primary channel
- Rich Menu and chatbot flow
- Deep linking to Web Loyalty
- Optional Facebook Messenger integration

---

### 2.7 Notification & Customer Communication
- LINE notifications for points and promotions
- Campaign broadcast
- Personalized messages

---

## 3. Functional Requirements for Admin Portal

### 3.1 Admin & Backoffice
- Web-based admin portal
- Member, point, reward, promotion management
- Role-based access control
- Manual point adjustment

---

### 3.2 Analytics & Reporting
- Dashboards and KPIs
- Campaign performance tracking
- Data export (Excel / CSV)

---

### 3.3 Security & Compliance
- LINE-based authentication
- PDPA consent management
- Transaction logging

---

### 3.4 Member
- **Member profile**: Name, Surname, National type (Thai or Other), Citizen ID, Passport, Sex, Birthdate, Mobile, Email, Point balance, Address
- **Address**: Address no., Building, Road, Soi, Subdistrict, District, Province, Postal code
- **Point History**: View and filter point ledger (earn, redeem, adjust)
- **Manual point adjustment**: Add or deduct points with reason (admin-only)

---

## 4. Non-Functional Requirements (NFR)

### 4.1 Performance
- Support concurrent users at peak campaign periods
- Point calculation and redemption response time ≤ **2 seconds**
- Admin dashboard load time ≤ **3 seconds**

---

### 4.2 Scalability
- Horizontal scalability to support user growth
- Support campaign traffic spikes without downtime
- Cloud-native or container-based deployment recommended

---

### 4.3 Availability & Reliability
- System availability ≥ **99.9%**
- No single point of failure
- Automated backup and recovery

---

### 4.4 Security
- Secure communication via HTTPS/TLS
- Data encryption at rest and in transit
- Role-based access control (RBAC)
- Audit logs for all critical actions

---

### 4.5 Privacy & Compliance
- PDPA compliance (Thailand)
- User consent management
- Data retention and deletion policy

---

### 4.6 Maintainability
- Modular service design
- Configuration-based campaign setup (low-code)
- Versioned APIs and backward compatibility

---

### 4.7 Observability & Monitoring
- Application and system monitoring
- Error logging and alerting
- Campaign and redemption anomaly detection

---

### 4.8 Integration
- REST API support
- Webhook for partner and POS integration
- Support for third-party platforms

---

### 4.9 Deployment & Operations
- CI/CD pipeline support
- Environment separation (DEV / SIT / UAT / PROD)
- Zero-downtime deployment capability
