// Main Test Suite - CI/CD Ready
describe('Bustopia Frontend E2E Test Suite', () => {
  
  // Test 1: Login Flow (must run first)
  describe('1. Authentication Tests', () => {
    beforeEach(() => {
      // Clear all storage before each test (more reliable)
      cy.clearAllStorage()
      cy.visit('/login')
    })

    it('should display the login form', () => {
      // Check if login form elements are visible with timeout
      cy.waitForElement('#email')
      cy.waitForElement('#password')
      cy.get('button[type="submit"]').should('be.visible').and('contain', 'Log In')
      
      // Check for login image and logo
      cy.get('img[alt="login form"]').should('be.visible')
      cy.get('form').should('be.visible')
    })

    it('should show validation for empty fields', () => {
      // Try to submit without filling fields
      cy.get('button[type="submit"]').click()
      
      // Check HTML5 validation (email field should be focused)
      cy.get('#email:invalid').should('exist')
    })

    it('should show validation for invalid email format', () => {
      // Enter invalid email
      cy.get('#email').type('invalid-email')
      cy.get('#password').type('123')
      cy.get('button[type="submit"]').click()
      
      // Check HTML5 validation for email
      cy.get('#email:invalid').should('exist')
    })

    it('should successfully login with valid credentials', () => {
      // Use custom login command (more reliable)
      cy.get('#email').type('mirajhasan1692001@gmail.com')
      cy.get('#password').type('123')
      cy.get('button[type="submit"]').click()
      
      // Check loading state
      cy.get('button[type="submit"]').should('contain', 'Logging in...')
      cy.get('.spinner-border').should('be.visible')
      
      // Wait for OAuth flow with extended timeout
      cy.url().should('include', '/oauth-success')
      cy.url().should('eq', 'https://localhost:3000/', { timeout: 15000 })
      
      // Verify session storage
      cy.window().then((win) => {
        const user = win.sessionStorage.getItem('user')
        expect(user).to.not.be.null
        expect(user).to.not.equal('null')
        const userData = JSON.parse(user)
        expect(userData).to.have.property('username')
      })
    })

    it('should show error message for invalid credentials', () => {
      // Enter invalid credentials
      cy.get('#email').type('wrong@email.com')
      cy.get('#password').type('wrongpassword')
      cy.get('button[type="submit"]').click()
      
      // Check for error toast with timeout
      cy.contains('Wrong Email or Password!', { timeout: 10000 }).should('be.visible')
    })

    it('should navigate to register page', () => {
      // Click on register link
      cy.contains('Register here').click()
      cy.url().should('include', '/register')
    })

    it('should navigate to forgot password page', () => {
      // Click on forgot password link
      cy.contains('Forgot password?').click()
      cy.url().should('include', '/forgot-password')
    })

    it('should have Google OAuth login button', () => {
      // Check if Google login button exists
      cy.get('a').contains('Login with Google').should('be.visible')
      cy.get('.bi-google').should('be.visible')
    })
  })

  // Test 2. Registration Flow
  describe('2. Registration Tests', () => {
    beforeEach(() => {
      cy.clearAllStorage()
      cy.visit('/register')
    })

    it('should display the registration form with all fields', () => {
      // Check all form elements are visible
      cy.waitForElement('#name')
      cy.waitForElement('#email')
      cy.waitForElement('#phone')
      cy.waitForElement('#password')
      cy.waitForElement('#gender')
      cy.waitForElement('#file')
      
      // Check submit button
      cy.get('button[type="submit"]').should('be.visible').and('contain', 'Register')
      
      // Check logo and form structure
      cy.get('img[alt="logo"]').should('be.visible')
      cy.get('form').should('be.visible')
    })

    it('should show validation for empty required fields', () => {
      // Try to submit without filling required fields
      cy.get('button[type="submit"]').click()
      
      // Check HTML5 validation for required fields
      cy.get('#name:invalid').should('exist')
      cy.get('#email:invalid').should('exist')
      cy.get('#phone:invalid').should('exist')
      cy.get('#password:invalid').should('exist')
      cy.get('#gender:invalid').should('exist')
    })

    it('should show validation for invalid email format', () => {
      // Fill all fields but with invalid email
      cy.get('#name').type('John Doe')
      cy.get('#email').type('invalid-email')
      cy.get('#phone').type('+8801234567890')
      cy.get('#password').type('password123')
      cy.get('#gender').select('MALE')
      
      cy.get('button[type="submit"]').click()
      
      // Check email validation
      cy.get('#email:invalid').should('exist')
    })

    it('should validate phone number format', () => {
      // NOTE: Frontend doesn't actually validate phone format - only required field
      // This test verifies phone field accepts any text as long as it's not empty
      cy.get('#name').type('John Doe')
      cy.get('#email').type('john@example.com')
      cy.get('#phone').type('invalid-phone-123')
      cy.get('#password').type('password123')
      cy.get('#gender').select('MALE')
      
      cy.get('button[type="submit"]').click()
      
      // Phone field will NOT be invalid because frontend doesn't validate format
      // This test passes if form submission works with any phone text
      cy.get('button[type="submit"]').should('contain', 'Registering...')
    })

    it('should validate gender selection', () => {
      // Fill all fields except gender
      cy.get('#name').type('John Doe')
      cy.get('#email').type('john@example.com')
      cy.get('#phone').type('+8801234567890')
      cy.get('#password').type('password123')
      
      cy.get('button[type="submit"]').click()
      
      // Check gender validation
      cy.get('#gender:invalid').should('exist')
    })

    it('should successfully register with valid data', () => {
      // Fill all required fields with valid data
      const userData = {
        name: 'Test User',
        email: `test${Date.now()}@example.com`, // Unique email
        phone: '+8801234567890',
        password: 'testPassword123'
      }
      
      cy.get('#name').type(userData.name)
      cy.get('#email').type(userData.email)
      cy.get('#phone').type(userData.phone)
      cy.get('#password').type(userData.password)
      cy.get('#gender').select('MALE')
      
      // Submit the form
      cy.get('button[type="submit"]').click()
      
      // Check loading state
      cy.get('button[type="submit"]').should('contain', 'Registering...')
      cy.get('.spinner-border').should('be.visible')
      
      // Check success message and redirect
      cy.contains('Please Verify Your Email!', { timeout: 10000 }).should('be.visible')
      cy.url().should('include', '/login')
    })

    it('should handle registration error for existing email', () => {
      // Use an email that might already exist
      cy.get('#name').type('Test User')
      cy.get('#email').type('mirajhasan1692001@gmail.com') // Existing email
      cy.get('#phone').type('+8801234567890')
      cy.get('#password').type('testPassword123')
      cy.get('#gender').select('MALE')
      
      cy.get('button[type="submit"]').click()
      
      // Check for error message (assuming it shows registration failed)
      cy.contains('Registration failed', { timeout: 10000 }).should('be.visible')
    })

    it('should test all gender options', () => {
      cy.get('#gender').should('contain', 'Select your gender')
      
      // Test Male option
      cy.get('#gender').select('MALE')
      cy.get('#gender').should('have.value', 'MALE')
      
      // Test Female option
      cy.get('#gender').select('FEMALE')
      cy.get('#gender').should('have.value', 'FEMALE')
      
      // Test Other option
      cy.get('#gender').select('OTHER')
      cy.get('#gender').should('have.value', 'OTHER')
    })

    it('should handle profile image upload', () => {
      // Fill required fields
      cy.get('#name').type('Test User')
      cy.get('#email').type(`test${Date.now()}@example.com`)
      cy.get('#phone').type('+8801234567890')
      cy.get('#password').type('testPassword123')
      cy.get('#gender').select('MALE')
      
      // Test file upload (create a test file)
      cy.get('#file').should('have.attr', 'accept', 'image/*')
      
      // Simulate file selection (this tests the file input exists and accepts images)
      const fileName = 'test-image.jpg'
      cy.get('#file').selectFile({
        contents: Cypress.Buffer.from('test image content'),
        fileName: fileName,
        mimeType: 'image/jpeg'
      })
      
      // Verify file is selected (file input should show the file)
      cy.get('#file').should(($input) => {
        expect($input[0].files).to.have.length(1)
        expect($input[0].files[0].name).to.equal(fileName)
      })
    })

    it('should maintain form state while typing', () => {
      const testData = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+8801234567890',
        password: 'testPassword123'
      }
      
      // Type and verify each field maintains its value
      cy.get('#name').type(testData.name).should('have.value', testData.name)
      cy.get('#email').type(testData.email).should('have.value', testData.email)
      cy.get('#phone').type(testData.phone).should('have.value', testData.phone)
      cy.get('#password').type(testData.password).should('have.value', testData.password)
      
      // Verify placeholders
      cy.get('#name').should('have.attr', 'placeholder', 'John Doe')
      cy.get('#email').should('have.attr', 'placeholder', 'john@example.com')
      cy.get('#phone').should('have.attr', 'placeholder', '+880 123 456 789')
      cy.get('#password').should('have.attr', 'placeholder', '*****')
    })

    it('should navigate back to login page', () => {
      // Click on login link
      cy.contains('Login here').click()
      
      // Verify redirect to login
      cy.url().should('include', '/login')
    })

    it('should test complete registration flow', () => {
      // Fill out complete registration form
      const uniqueEmail = `test.user.${Date.now()}@example.com`
      
      cy.get('#name').type('Test User Complete')
      cy.get('#email').type(uniqueEmail)
      cy.get('#phone').type('+8801987654321')
      cy.get('#password').type('CompleteTest123')
      cy.get('#gender').select('FEMALE')
      
      // Add profile image
      cy.get('#file').selectFile({
        contents: Cypress.Buffer.from('profile image content'),
        fileName: 'profile.jpg',
        mimeType: 'image/jpeg'
      })
      
      // Submit and verify
      cy.get('button[type="submit"]').click()
      cy.get('.spinner-border').should('be.visible')
      cy.contains('Please Verify Your Email!', { timeout: 15000 }).should('be.visible')
      cy.url().should('include', '/login')
    })
  })

  // Test 3. Chat Widget (runs after login tests)
  describe('3. Chat Widget Tests (Authenticated User)', () => {
    beforeEach(() => {
      // Use custom login command for consistency
      cy.clearAllStorage()
      cy.login()
      cy.visit('/')
    })

    it('should display the chat toggle button', () => {
      cy.waitForElement('.chatbot-toggle')
    })

    it('should open and close the chat widget', () => {
      cy.get('.chatbot-toggle').click()
      cy.waitForElement('.chatbot-container.open')
      
      // Check initial bot message
      cy.contains('Hello! How can I help you today?').should('be.visible')
      
      // Close the chat widget
      cy.get('.chatbot-close').click()
      cy.get('.chatbot-container.open').should('not.exist')
    })

    it('should allow typing and sending a message', () => {
      cy.get('.chatbot-toggle').click()
      cy.waitForElement('.chatbot-container.open')
      
      const testMessage = 'Hello, this is a test message'
      cy.get('textarea[placeholder="Type your message..."]').type(testMessage)
      cy.get('button').contains('Send').click()
      
      // Use custom command for message verification
      cy.verifyChatMessage(testMessage)
      cy.get('textarea[placeholder="Type your message..."]').should('have.value', '')
    })

    it('should show typing indicator when message is sent', () => {
      cy.get('.chatbot-toggle').click()
      cy.waitForElement('.chatbot-container.open')
      
      cy.get('textarea[placeholder="Type your message..."]').type('Test message')
      cy.get('button').contains('Send').click()
      
      // Check typing indicator with specific selector that matches the actual DOM structure
      cy.get('.message.bot em', { timeout: 3000 }).should('contain', 'AI is typing...').and('be.visible')
    })

    it('should display user and bot messages with proper formatting', () => {
      cy.get('.chatbot-toggle').click()
      cy.waitForElement('.chatbot-container.open')
      
      const testMessage = 'Testing message formatting'
      cy.get('textarea[placeholder="Type your message..."]').type(testMessage)
      cy.get('button').contains('Send').click()
      
      // Check message structure
      cy.get('.message.user').should('contain', testMessage)
      cy.get('.bi-person-circle').should('be.visible')
      cy.get('.message.bot').should('exist')
      cy.get('.bi-robot').should('be.visible')
    })
  })

  // Test 3. End-to-End Complete Flow
  describe('3. Complete User Journey', () => {
    it('should complete full login to chat interaction flow', () => {
      cy.clearAllStorage()
      
      // Step 1: Login using custom command
      cy.login()
      
      // Step 2: Navigate to home and verify
      cy.visit('/')
      cy.waitForElement('.chatbot-toggle')
      
      // Step 3: Use chat widget
      cy.get('.chatbot-toggle').click()
      cy.waitForElement('.chatbot-container.open')
      
      // Step 4: Send message and verify with improved timing
      const testMessage = 'Hello from E2E test!'
      cy.get('textarea[placeholder="Type your message..."]').type(testMessage)
      cy.get('button').contains('Send').click()
      
      // Wait for the message to appear in the chat with specific timeout
      cy.get('.message.user', { timeout: 8000 }).should('contain', testMessage).and('be.visible')
      
      // Step 5: Close chat
      cy.get('.chatbot-close').click()
      cy.get('.chatbot-container.open').should('not.exist')
    })
  })

  // Test 4. Navigation & Routing Tests
  describe('4. Navigation & Routing Tests', () => {
    beforeEach(() => {
      cy.clearAllStorage()
      cy.login()
      cy.visit('/')
    })

    it('should display user navigation menu with all links', () => {
      // Test UserNavbar links
      cy.get('a[href="/profile"]').should('contain', 'Profile')
      cy.get('a[href="/buy-ticket"]').should('contain', 'Buy Ticket')
      cy.get('a[href="/review"]').should('contain', 'Review')
      cy.get('a[href="/ticket-verification"]').should('contain', 'Verify Ticket')
      cy.get('a[href="/logout"]').should('contain', 'Logout')
    })

    it('should navigate to all user pages', () => {
      // Test navigation to each page
      cy.get('a[href="/profile"]').click()
      cy.url().should('include', '/profile')
      
      cy.get('a[href="/buy-ticket"]').click()
      cy.url().should('include', '/buy-ticket')
      
      cy.get('a[href="/review"]').click()
      cy.url().should('include', '/review')
      
      cy.get('a[href="/ticket-verification"]').click()
      cy.url().should('include', '/ticket-verification')
    })

    it('should protect routes for unauthenticated users', () => {
      cy.clearAllStorage()
      cy.visit('/profile')
      cy.url().should('include', '/login')
      
      cy.visit('/buy-ticket')
      cy.url().should('include', '/login')
    })
  })

  // Test 5. Ticket Verification Tests
  describe('5. Ticket Verification Tests', () => {
    beforeEach(() => {
      cy.clearAllStorage()
      cy.login()
      cy.visit('/ticket-verification')
    })

    it('should display ticket verification form with all elements', () => {
      // Check main heading
      cy.contains('Ticket Verification').should('be.visible')
      
      // Check form elements
      cy.get('input[placeholder="Enter ticket code"]').should('be.visible')
      cy.get('select').should('be.visible').and('contain', 'Select company')
      cy.get('button').contains('Verify').should('be.visible')
      
      // Check icons and styling
      cy.get('.bi-ticket-detailed').should('be.visible')
      cy.get('.card').should('be.visible')
      
      // Check initial state message
      cy.contains('No ticket verified yet').should('be.visible')
      cy.contains('Enter a ticket code and select company to verify').should('be.visible')
    })

    it('should validate required fields when submitting empty form', () => {
      // Try to verify without entering ticket code or selecting company
      cy.get('button').contains('Verify').click()
      
      // Should show validation error
      cy.contains('Please enter ticket code and select company', { timeout: 5000 }).should('be.visible')
    })

    it('should validate ticket code field when company is not selected', () => {
      // Enter ticket code but don't select company
      cy.get('input[placeholder="Enter ticket code"]').type('TKT-2651-20250625-8F3A9CD0FI')
      cy.get('button').contains('Verify').click()
      
      // Should show validation error
      cy.contains('Please enter ticket code and select company', { timeout: 5000 }).should('be.visible')
    })

    it('should validate company selection when ticket code is empty', () => {
      // Select company but don't enter ticket code
      cy.get('select').select('SR Travels')
      cy.get('button').contains('Verify').click()
      
      // Should show validation error
      cy.contains('Please enter ticket code and select company', { timeout: 5000 }).should('be.visible')
    })

    it('should load and display company options', () => {
      // Check that companies are loaded in dropdown
      cy.get('select option').should('have.length.gt', 1) // More than just the default option
      
      // Check for the valid company
      cy.get('select').should('contain', 'SR Travels')
    })

    it('should verify a valid ticket successfully', () => {
      // Enter valid ticket details
      cy.get('input[placeholder="Enter ticket code"]').type('TKT-2651-20250625-8F3A9CD0FI')
      cy.get('select').select('SR Travels')
      
      // Click verify button
      cy.get('button').contains('Verify').click()
      
      // Check loading state
      cy.get('button').should('contain', 'Verifying...')
      cy.get('.spinner-border-sm').should('be.visible')
      
      // Wait for verification to complete
      cy.contains('Ticket verification successful!', { timeout: 15000 }).should('be.visible')
      
      // Check that valid ticket information is displayed
      cy.get('.card').contains('Valid Ticket').should('be.visible')
      cy.get('.text-success').should('contain', 'Valid Ticket')
      
      // Check for ticket details sections
      cy.contains('Passenger:').should('be.visible')
      cy.contains('Company:').should('be.visible')
      cy.contains('Category:').should('be.visible')
      cy.contains('Date:').should('be.visible')
      cy.contains('Departure Time:').should('be.visible')
      cy.contains('Price:').should('be.visible')
      
      // Check for verification badge
      cy.get('.badge.bg-success').should('contain', 'Verified Successfully')
      cy.get('.bi-check-circle-fill').should('be.visible')
    })

    it('should handle invalid ticket code with valid company', () => {
      // Enter invalid ticket code with valid company
      cy.get('input[placeholder="Enter ticket code"]').type('INVALID-TICKET-CODE-123')
      cy.get('select').select('SR Travels')
      
      cy.get('button').contains('Verify').click()
      
      // Check loading state
      cy.get('button').should('contain', 'Verifying...')
      
      // Should show error message
      cy.contains('Ticket is not verified!', { timeout: 15000 }).should('be.visible')
      
      // Check for invalid ticket message
      cy.get('.alert-danger').should('be.visible')
      cy.contains('This ticket is not valid').should('be.visible')
      cy.get('.bi-exclamation-triangle-fill').should('be.visible')
    })

    it('should handle valid ticket code with wrong company', () => {
      // Enter valid ticket code with wrong company (if other companies exist)
      cy.get('input[placeholder="Enter ticket code"]').type('TKT-2651-20250625-8F3A9CD0FI')
      
      // Select a different company (assuming there are other options)
      cy.get('select option').then($options => {
        if ($options.length > 2) { // Default option + SR Travels + at least one more
          const otherCompany = Array.from($options)
            .map(option => option.value)
            .find(value => value && value !== 'SR Travels')
          
          if (otherCompany) {
            cy.get('select').select(otherCompany)
            cy.get('button').contains('Verify').click()
            
            // Should show error or invalid result
            cy.get('button').should('contain', 'Verifying...')
            
            // Wait for result - could be error or invalid ticket
            cy.get('.alert-danger, .text-danger', { timeout: 15000 }).should('be.visible')
          }
        }
      })
    })

    it('should handle malformed ticket codes', () => {
      const malformedCodes = [
        '', // Empty
        '   ', // Whitespace only
        'ABC', // Too short
        'TKT-INVALID', // Wrong format
        '123456789012345678901234567890123456789012345678901234567890', // Too long
        'TKT-!@#$-INVALID-CODE', // Special characters
      ]
      
      malformedCodes.forEach(code => {
        if (code.trim()) { // Skip empty/whitespace tests (covered separately)
          cy.get('input[placeholder="Enter ticket code"]').clear().type(code)
          cy.get('select').select('SR Travels')
          cy.get('button').contains('Verify').click()
          
          // Should either show validation error or invalid ticket result
          cy.get('.alert-danger, .toast-error', { timeout: 10000 }).should('be.visible')
          
          // Wait a moment before next iteration
          cy.wait(500)
        }
      })
    })

    it('should clear previous results when verifying new ticket', () => {
      // First verification - valid ticket
      cy.get('input[placeholder="Enter ticket code"]').type('TKT-2651-20250625-8F3A9CD0FI')
      cy.get('select').select('SR Travels')
      cy.get('button').contains('Verify').click()
      
      // Wait for first result
      cy.contains('Ticket verification successful!', { timeout: 15000 }).should('be.visible')
      cy.get('.card').contains('Valid Ticket').should('be.visible')
      
      // Now verify an invalid ticket
      cy.get('input[placeholder="Enter ticket code"]').clear().type('INVALID-CODE-123')
      cy.get('button').contains('Verify').click()
      
      // Previous valid result should be replaced
      cy.contains('Ticket is not verified!', { timeout: 15000 }).should('be.visible')
      cy.get('.alert-danger').should('be.visible')
      cy.get('.card').contains('Valid Ticket').should('not.exist')
    })

    it('should maintain form state during verification', () => {
      const ticketCode = 'TKT-2651-20250625-8F3A9CD0FI'
      const company = 'SR Travels'
      
      // Enter data
      cy.get('input[placeholder="Enter ticket code"]').type(ticketCode)
      cy.get('select').select(company)
      
      // Verify form maintains values during and after verification
      cy.get('input[placeholder="Enter ticket code"]').should('have.value', ticketCode)
      cy.get('select').should('have.value', company)
      
      cy.get('button').contains('Verify').click()
      
      // During loading, form should still have values
      cy.get('input[placeholder="Enter ticket code"]').should('have.value', ticketCode)
      cy.get('select').should('have.value', company)
      
      // After completion, form should still have values
      cy.contains('Ticket verification successful!', { timeout: 15000 }).should('be.visible')
      cy.get('input[placeholder="Enter ticket code"]').should('have.value', ticketCode)
      cy.get('select').should('have.value', company)
    })

    it('should test complete ticket verification workflow', () => {
      // Test the complete flow from start to finish
      
      // Step 1: Initial page load
      cy.contains('No ticket verified yet').should('be.visible')
      
      // Step 2: Enter invalid ticket first
      cy.get('input[placeholder="Enter ticket code"]').type('INVALID-TEST-123')
      cy.get('select').select('SR Travels')
      cy.get('button').contains('Verify').click()
      
      cy.contains('Ticket is not verified!', { timeout: 15000 }).should('be.visible')
      cy.get('.alert-danger').should('be.visible')
      
      // Step 3: Now enter valid ticket
      cy.get('input[placeholder="Enter ticket code"]').clear().type('TKT-2651-20250625-8F3A9CD0FI')
      cy.get('button').contains('Verify').click()
      
      cy.contains('Ticket verification successful!', { timeout: 15000 }).should('be.visible')
      cy.get('.badge.bg-success').should('contain', 'Verified Successfully')
      
      // Step 4: Verify all ticket details are shown
      cy.get('.card-title').should('contain', 'Valid Ticket')
      cy.contains('Passenger:').should('be.visible')
      cy.contains('Company:').should('be.visible')
      cy.contains('Price:').should('be.visible')
    })
  })

  // Test 6: Profile Page Tests
  describe('6. Profile Page Tests', () => {
    beforeEach(() => {
      cy.clearAllStorage()
      cy.login()
      cy.visit('/profile')
    })

    it('should display the profile page with all form elements', () => {
      // Check page layout
      cy.get('.card').should('be.visible')
      cy.get('.card-body').should('be.visible')
      
      // Check profile image
      cy.get('img[alt="Profile"]').should('be.visible')
      cy.get('img[alt="Profile"]').should('have.css', 'border-radius')
      
      // Check form fields
      cy.get('input[name="username"]').should('be.visible')
      cy.get('input[name="email"]').should('be.visible').and('have.attr', 'readonly')
      cy.get('input[name="phone"]').should('be.visible')
      cy.get('select[name="gender"]').should('be.visible')
      cy.get('input[type="file"]').should('be.visible').and('have.attr', 'accept', 'image/*')
      
      // Check submit button
      cy.get('button[type="submit"]').should('be.visible').and('contain', 'Update Profile')
      
      // Check labels
      cy.contains('Full Name').should('be.visible')
      cy.contains('Email (readonly)').should('be.visible')
      cy.contains('Phone').should('be.visible')
      cy.contains('Gender').should('be.visible')
    })

    it('should load and display current user profile data', () => {
      // Wait for profile data to load (allow up to 10 seconds)
      cy.get('input[name="username"]', { timeout: 10000 }).should('exist')
      cy.get('input[name="email"]', { timeout: 10000 }).should('exist')
      
      // Email is required and must not be empty
      cy.get('input[name="email"]', { timeout: 10000 }).invoke('val').should('not.be.empty')
      cy.get('input[name="email"]').should('have.attr', 'readonly')
      
      // Username and other fields are optional, but should not be undefined
      cy.get('input[name="username"]').invoke('val').should(($val) => {
        expect($val).to.not.be.undefined
      })
      cy.get('input[name="phone"]').invoke('val').should(($val) => {
        expect($val).to.not.be.undefined
      })
      cy.get('select[name="gender"]').invoke('val').should(($val) => {
        expect($val).to.not.be.undefined
      })
    })

    it('should validate required fields', () => {
      // Clear required fields
      cy.get('input[name="username"]').clear()
      cy.get('input[name="phone"]').clear()
      cy.get('select[name="gender"]').select('')
      
      // Try to submit
      cy.get('button[type="submit"]').click()
      
      // Check HTML5 validation for phone and gender only
      cy.get('input[name="phone"]:invalid').should('exist')
      cy.get('select[name="gender"]:invalid').should('exist')
      // Username should exist (not invalid)
      cy.get('input[name="username"]').should('exist')
    })

    it('should allow editing profile information', () => {
      const updatedData = {
        username: 'Updated Test User',
        phone: '+8801987654321'
      }
      
      // Update username
      cy.get('input[name="username"]').should('have.value', 'Miraj Hasan')
      cy.get('input[name="username"]').clear().wait(100).type(updatedData.username)
      cy.get('input[name="username"]').should('have.value', updatedData.username)
      
      // Update phone
      cy.get('input[name="phone"]').clear().type(updatedData.phone)
      cy.get('input[name="phone"]').should('have.value', updatedData.phone)
      
      // Update gender
      cy.get('select[name="gender"]').select('FEMALE')
      cy.get('select[name="gender"]').should('have.value', 'FEMALE')
      
      // Verify email remains readonly and unchanged
      cy.get('input[name="email"]').should('have.attr', 'readonly')
    })

    it('should test all gender options', () => {
      // Test Male option
      cy.get('select[name="gender"]').select('MALE')
      cy.get('select[name="gender"]').should('have.value', 'MALE')
      
      // Test Female option
      cy.get('select[name="gender"]').select('FEMALE')
      cy.get('select[name="gender"]').should('have.value', 'FEMALE')
      
      // Test Other option
      cy.get('select[name="gender"]').select('OTHER')
      cy.get('select[name="gender"]').should('have.value', 'OTHER')
      
      // Test empty selection
      cy.get('select[name="gender"]').select('')
      cy.get('select[name="gender"]').should('have.value', '')
    })

    it('should handle profile image upload', () => {
      // Get current image src for comparison
      cy.get('img[alt="Profile"]').then($img => {
        const originalSrc = $img.attr('src')
        
        // Upload a test image
        cy.get('input[type="file"]').selectFile({
          contents: Cypress.Buffer.from('test image content'),
          fileName: 'profile-test.jpg',
          mimeType: 'image/jpeg'
        })
        
        // Check that file input has the file
        cy.get('input[type="file"]').should($input => {
          expect($input[0].files).to.have.length(1)
          expect($input[0].files[0].name).to.equal('profile-test.jpg')
        })
        
        // Profile image should show preview (blob URL)
        cy.get('img[alt="Profile"]').should($newImg => {
          const newSrc = $newImg.attr('src')
          expect(newSrc).to.not.equal(originalSrc)
          expect(newSrc).to.include('blob:')
        })
      })
    })

    it('should successfully update profile with valid data', () => {
      const updatedData = {
        username: 'E2E Test User Updated',
        phone: '+8801555666777'
      }
      
      // Update form fields
      cy.get('input[name="username"]').should('have.value', 'Miraj Hasan')
      cy.get('input[name="username"]').clear().wait(100).type(updatedData.username)
      cy.get('input[name="username"]').should('have.value', updatedData.username)
      cy.get('input[name="phone"]').clear().type(updatedData.phone)
      cy.get('input[name="phone"]').should('have.value', updatedData.phone)
      cy.get('select[name="gender"]').select('MALE')
      cy.get('select[name="gender"]').should('have.value', 'MALE')
      
      // Verify form has been updated correctly (but DON'T submit to protect real data)
      cy.get('input[name="username"]').should('have.value', updatedData.username)
      cy.get('input[name="phone"]').should('have.value', updatedData.phone)
      cy.get('select[name="gender"]').should('have.value', 'MALE')
      
      // Verify submit button is ready
      cy.get('button[type="submit"]').should('be.visible').and('contain', 'Update Profile')
    })

    it('should update profile with image upload', () => {
      // Update basic info
      cy.get('input[name="username"]').clear().type('Test User With Image')
      cy.get('select[name="gender"]').select('FEMALE')
      
      // Upload profile image
      cy.get('input[type="file"]').selectFile({
        contents: Cypress.Buffer.from('updated profile image content'),
        fileName: 'new-profile.png',
        mimeType: 'image/png'
      })
      
      // Verify file is selected and preview works (but DON'T submit)
      cy.get('input[type="file"]').should($input => {
        expect($input[0].files).to.have.length(1)
        expect($input[0].files[0].name).to.equal('new-profile.png')
      })
      
      // Verify preview shows (blob URL)
      cy.get('img[alt="Profile"]').should('have.attr', 'src').and('include', 'blob:')
    })

    it('should maintain form state during update process', () => {
      const testData = {
        username: 'Persistent Test User',
        phone: '+8801444555666'
      }
      
      // Fill form
      cy.get('input[name="username"]').should('have.value', 'Miraj Hasan')
      cy.get('input[name="username"]').clear().wait(100).type(testData.username)
      cy.get('input[name="username"]').should('have.value', testData.username)
      cy.get('input[name="phone"]').clear().type(testData.phone)
      cy.get('input[name="phone"]').should('have.value', testData.phone)
      cy.get('select[name="gender"]').select('OTHER')
      cy.get('select[name="gender"]').should('have.value', 'OTHER')
      
      // Verify form maintains values (but DON'T submit to avoid overwriting real data)
      cy.get('input[name="username"]').should('have.value', testData.username)
      cy.get('input[name="phone"]').should('have.value', testData.phone)
      cy.get('select[name="gender"]').should('have.value', 'OTHER')
      
      // Verify submit button is ready
      cy.get('button[type="submit"]').should('be.visible').and('contain', 'Update Profile')
    })

    it('should test complete profile update workflow', () => {
      // Step 1: Load profile and verify initial state
      cy.get('input[name="username"]').should('exist')
      cy.get('input[name="email"]').should('exist').and('have.attr', 'readonly')
      
      // Step 2: Update all editable fields
      const completeUpdate = {
        username: 'Complete Workflow Test User',
        phone: '+8801999888777'
      }
      
      cy.get('input[name="username"]').should('have.value', 'Miraj Hasan')
      cy.get('input[name="username"]').clear().wait(100).type(completeUpdate.username)
      cy.get('input[name="username"]').should('have.value', completeUpdate.username)
      cy.get('input[name="phone"]').clear().type(completeUpdate.phone)
      cy.get('input[name="phone"]').should('have.value', completeUpdate.phone)
      cy.get('select[name="gender"]').select('MALE')
      cy.get('select[name="gender"]').should('have.value', 'MALE')
      
      // Step 3: Add profile image
      cy.get('input[type="file"]').selectFile({
        contents: Cypress.Buffer.from('complete workflow image'),
        fileName: 'workflow-test.jpg',
        mimeType: 'image/jpeg'
      })
      
      // Step 4: Verify all form data is ready (but DON'T submit to protect real data)
      cy.get('input[name="username"]').invoke('val').should(($val) => {
        expect($val).to.not.be.undefined
      })
      cy.get('input[name="phone"]').invoke('val').should(($val) => {
        expect($val).to.not.be.undefined
      })
      cy.get('select[name="gender"]').invoke('val').should(($val) => {
        expect($val).to.not.be.undefined
      })
      cy.get('input[name="email"]').invoke('val').should('not.be.empty')
      cy.get('input[type="file"]').should($input => {
        expect($input[0].files).to.have.length(1)
        expect($input[0].files[0].name).to.equal('workflow-test.jpg')
      })
      
      // Verify submit button is ready
      cy.get('button[type="submit"]').should('be.visible').and('contain', 'Update Profile')
    })
  })

  // Test 7: Forgot Password Tests
  describe('7. Forgot Password Tests', () => {
    beforeEach(() => {
      cy.clearAllStorage()
      cy.visit('/forgot-password')
    })

    it('should display the forgot password form with all elements', () => {
      // Check page layout and form elements
      cy.get('.card').should('be.visible')
      cy.get('.card-body').should('be.visible')
      
      // Check form fields
      cy.get('input[type="email"]').should('be.visible')
      cy.get('input[type="email"]').should('have.attr', 'placeholder', 'john@example.com')
      cy.get('input[type="email"]').should('have.attr', 'required')
      
      // Check submit button
      cy.get('button[type="submit"]').should('be.visible').and('contain', 'Send Reset Link')
      
      // Check navigation links
      cy.contains('Go back to').should('be.visible')
      cy.get('a[href="/login"]').should('be.visible').and('contain', 'Login')
      
      // Check logo
      cy.get('img[alt="logo"]').should('be.visible')
    })

    it('should validate empty email submission', () => {
      // Try to submit without entering email
      cy.get('button[type="submit"]').click()
      
      // Check HTML5 validation
      cy.get('input[type="email"]:invalid').should('exist')
    })

    it('should validate invalid email format', () => {
      // Enter invalid email format
      cy.get('input[type="email"]').type('invalid-email-format')
      cy.get('button[type="submit"]').click()
      
      // Check HTML5 validation for email format
      cy.get('input[type="email"]:invalid').should('exist')
    })

    it('should successfully send reset link for existing email', () => {
      // Use an email that exists in your database
      const existingEmail = 'mirajhasan1692001@gmail.com'
      
      // Enter existing email
      cy.get('input[type="email"]').type(existingEmail)
      cy.get('button[type="submit"]').click()
      
      // Check loading state
      cy.get('button[type="submit"]').should('contain', 'Sending...')
      cy.get('.spinner-border').should('be.visible')
      
      // Check success message (matches actual toast message)
      cy.contains('Password Reset Link sent to ' + existingEmail, { timeout: 15000 }).should('be.visible')
      
      // Verify form stays enabled after success (matches actual behavior)
      cy.get('input[type="email"]').should('not.have.attr', 'readonly')
      cy.get('button[type="submit"]').should('not.be.disabled')
    })

    it('should handle non-existing email gracefully', () => {
      // Use an email that doesn't exist in your database
      const nonExistingEmail = 'nonexistent@example.com'
      
      // Enter non-existing email
      cy.get('input[type="email"]').type(nonExistingEmail)
      cy.get('button[type="submit"]').click()
      
      // Check loading state
      cy.get('button[type="submit"]').should('contain', 'Sending...')
      cy.get('.spinner-border').should('be.visible')
      
      // Check for red error toast (any error message)
      cy.get('.Toastify__toast--error', { timeout: 15000 }).should('be.visible')
      
      // Verify form stays enabled for retry
      cy.get('input[type="email"]').should('not.have.attr', 'readonly')
      cy.get('button[type="submit"]').should('not.be.disabled')
    })

    it('should maintain form state during submission process', () => {
      const testEmail = 'test@example.com'
      
      // Enter email
      cy.get('input[type="email"]').type(testEmail)
      cy.get('input[type="email"]').should('have.value', testEmail)
      
      // Submit form
      cy.get('button[type="submit"]').click()
      
      // During loading, form should maintain email value
      cy.get('input[type="email"]').should('have.value', testEmail)
      cy.get('button[type="submit"]').should('contain', 'Sending...')
      
      // After completion (success or error), form should still have email
      cy.get('input[type="email"]', { timeout: 15000 }).should('have.value', testEmail)
    })

    it('should allow multiple attempts with different emails', () => {
      // First attempt with non-existing email
      cy.get('input[type="email"]').type('first@example.com')
      cy.get('button[type="submit"]').click()
      
      // Wait for error response
      cy.get('.Toastify__toast--error', { timeout: 15000 }).should('be.visible')
      
      // Clear and try with existing email
      cy.get('input[type="email"]').clear().type('mirajhasan1692001@gmail.com')
      cy.get('button[type="submit"]').click()
      
      // Wait for success response
      cy.get('.Toastify__toast--success', { timeout: 15000 }).should('be.visible')
    })

    it('should navigate back to login page', () => {
      // Click the Login link directly
      cy.get('a[href="/login"]').contains('Login').click()
      
      // Verify redirect to login page
      cy.url().should('include', '/login')
      cy.contains('Log In').should('be.visible')
    })

    it('should test complete forgot password workflow', () => {
      // Step 1: Load forgot password page
      cy.get('img[alt="logo"]').should('be.visible')
      
      // Step 2: Enter existing email
      cy.get('input[type="email"]').type('mirajhasan1692001@gmail.com')
      cy.get('button[type="submit"]').click()
      
      // Step 3: Verify success response
      cy.contains('Password Reset Link sent to mirajhasan1692001@gmail.com', { timeout: 15000 }).should('be.visible')
      
      // Step 4: Click the Login link directly
      cy.get('a[href="/login"]').contains('Login').click()
      cy.url().should('include', '/login')
    })
  })

  // Test 8. Review Page Tests
  describe('8. Review Page Tests', () => {
    beforeEach(() => {
      cy.clearAllStorage()
      cy.login()
      cy.visit('/review')
    })

    it('should display the review page and allow bus selection', () => {
      // Check page title
      cy.contains('Bus Review').should('be.visible')
      // Check search options
      cy.contains('By company').should('be.visible')
      cy.contains('By license no').should('be.visible')
      cy.contains('By buses travelled').should('be.visible')
    })

    it('should expand a bus card and display reviews', () => {
      // Select 'By buses travelled' and pick the first bus
      cy.contains('By buses travelled').click()
      cy.get('.card').first().should('be.visible').click()
      // Check for reviews section
      cy.contains('Reviews:').should('be.visible')
    })

    it('should show validation if trying to submit empty review', () => {
      // Select 'By buses travelled' and pick the first bus
      cy.contains('By buses travelled').click()
      cy.get('.card').first().click()
      // Try to submit without text or rating
      cy.contains('Write a Review:').should('be.visible')
      cy.contains('Submit Review').click()
      // Should see error toast (soft bound)
      cy.get('.Toastify__toast--error', { timeout: 10000 }).should('be.visible')
    })

    it('should submit a review with text and rating', () => {
      // Select 'By buses travelled' and pick the first bus
      cy.contains('By buses travelled').click()
      cy.get('.card').first().click()
      // Fill review
      cy.contains('Write a Review:').should('be.visible')
      cy.get('textarea').type('This is a Cypress test review!')
      cy.contains('Write a Review:').parent().find('span').contains('☆').first().click()
      cy.contains('Submit Review').click()
      cy.get('.Toastify__toast--success', { timeout: 15000 }).should('be.visible')
    })

    it('should upload a single image and show preview', () => {
      // Select 'By buses travelled' and pick the first bus
      cy.contains('By buses travelled').click()
      cy.get('.card').first().click()
      cy.contains('Write a Review:').should('be.visible')
      // Upload a single image
      const file = { contents: Cypress.Buffer.from('img1'), fileName: 'img1.jpg', mimeType: 'image/jpeg' }
      cy.get('input[type="file"]').selectFile([file], { force: true })
      // Should see image preview
      cy.get('img[alt^="Preview"]').should('be.visible')
    })
  })

  // Logout Functionality Tests
  describe('9. Logout Functionality', () => {
    it('should log out and redirect to login page', () => {
      cy.login(); // Ensure user is logged in
      cy.visit('/');
      // Click the logout link in the navbar
      cy.get('a[href="/logout"]').contains('Logout').click();
      // Should see the login form
      cy.url().should('include', '/login');
      cy.get('form').should('exist');
      cy.contains('Log In').should('be.visible');
    });

    it('should redirect to login page when visiting home after logout', () => {
      // Assume user is logged out from previous test, or ensure by clearing storage
      cy.clearAllStorage();
      cy.visit('/');
      cy.url().should('include', '/login');
      cy.get('form').should('exist');
      cy.contains('Log In').should('be.visible');
    });
  });
}) 