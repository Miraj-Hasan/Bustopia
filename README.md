# BusTopia 🌍

**BusTopia** is a full-featured intelligent bus ticket booking and management system designed for both users and administrators. It streamlines ticketing, improves scheduling and pricing using data-analysis techniques, and integrates technologies like AI assistance, CI/CD, and secure deployment.

---

## ✨ Key Features

### 1. 🚌 **Bus Service Information**

* Detailed information for each bus
* Dedicated "Buy Ticket" option for each bus

### 2. 📅 **Ticket Management**

* Smart search using:

  * Source, destination, date
  * Coach type (AC/Non-AC)
  * Budget range (min & max)
* Full seat layout viewing and booking

### 3. 💳 **Payment Gateway Integration**

* Secure payment handling for ticket purchases by SSLCommerz sandbox
* Seamless redirection to payment confirmation/cancel routes

### 4. ⏰ **Efficient Scheduling**

* Monthly data-driven schedule optimization:

  * Buses with low demand schedules are reassigned to high-demand slots
  * Fixed route & schedule per bus, but schedules adjusted monthly

### 5. 💸 **Efficient Pricing**

* Demand-based dynamic pricing:

  * Popular tickets have increased prices in the following month
  * Ensures optimized revenue and bus utilization

### 6. 📈 **User Ratings & Reviews**

* Users can:

  * Rate buses they’ve traveled on
  * Write reviews and upload pictures
* Only verified travelers of a bus can review the bus to maintain legitimacy

### 7. 🧠 **AI Assistant Chatbot**

* In-app AI chatbot features:

  * Bus recommendations based on source & destination
  * Basic Q\&A on the platform
  * Natural AI conversations supported

### 8. 📄 **Ticket Verification**

* Each ticket has a unique **ticket code**
* Tickets can be verified using this code to detect fraud

### 9. ❌ **Ticket Cancellation**

* Users can cancel their tickets **up to 24 hours** before the journey

### 10. 📆 **Admin Features**

* Admin login & dashboard
* Modify parameters for:

  * Efficient pricing (e.g., demand thresholds)
  * Efficient scheduling (e.g., peak hours)
* View latest analytical insights on user behavior, routes, and bus demand

### 12. 🔐 **Authentication**

* Traditional registration/login
* Google OAuth 2.0 integration for third-party login

---

## 🚀 Tech Stack

* **Frontend:** React.js (Vite)
* **Backend:** Spring Boot (Java 21)
* **Database:** PostgreSQL (hosted on [Supabase](https://supabase.com))
* **Deployment:** Azure VM
* **CI/CD:** GitHub Actions + Docker
* **Security:** HTTPS enabled
* **Testing:**

  * Unit Testing (Backend + Frontend) (Selected parts)
  * End-to-End Testing (Selected flows)

---

## 🔧 Running the Project

### ✅ Production URL

**Frontend:** [https://app.172.167.170.46.nip.io:3000/](https://app.172.167.170.46.nip.io:3000/)

### ⚠️ Note on First Time Load

Because the site uses HTTPS with a self-signed certificate:

1. If the frontend doesn't load on first try:
2. Visit this once in your browser:

   > [https://app.172.167.170.46.nip.io:8443/api/ping](https://app.172.167.170.46.nip.io:8443/api/ping)
3. Once visited, frontend loads smoothly in that browser forever.

---

## 🎥 Demo Videos

* 🎥 **Feature Walkthrough**:
  [https://youtu.be/2eusxxPA3s4?feature=shared](https://youtu.be/2eusxxPA3s4?feature=shared)

* 🎥 **Infrastructure & DevOps**:
  [https://youtu.be/dm1azcF_Jq0?feature=shared](https://youtu.be/dm1azcF_Jq0?feature=shared)

---

## ✍️ Authors & Contributors

* Built with ❤️ by the **BusTopia Team**

### 👥 Team Members
- **Md. Miraj Hasan**
- **Owaliur Rahman**
- **Iftekhar Ayon**

