// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

// Custom commands for CI/CD reliability

// Login command that can be reused across tests
Cypress.Commands.add('login', (email = 'mirajhasan1692001@gmail.com', password = '123') => {
  cy.session([email, password], () => {
    cy.visit('/login')
    cy.get('#email').type(email)
    cy.get('#password').type(password)
    cy.get('button[type="submit"]').click()
    
    // Wait for OAuth flow to complete
    cy.url().should('include', '/oauth-success')
    cy.url().should('eq', 'https://localhost:3000/', { timeout: 15000 })
    
    // Verify login was successful
    cy.window().then((win) => {
      const user = win.sessionStorage.getItem('user')
      expect(user).to.not.be.null
      expect(user).to.not.equal('null')
    })
  })
})

// Wait for element with retry logic
Cypress.Commands.add('waitForElement', (selector, timeout = 10000) => {
  cy.get(selector, { timeout }).should('be.visible')
})

// Clear all storage (more reliable than just sessionStorage)
Cypress.Commands.add('clearAllStorage', () => {
  cy.clearAllCookies()
  cy.clearAllLocalStorage()
  cy.clearAllSessionStorage()
  cy.window().then((win) => {
    win.sessionStorage.clear()
    win.localStorage.clear()
  })
})

// Custom assertion for chat message
Cypress.Commands.add('verifyChatMessage', (message) => {
  // Use more specific selector and timeout for user messages
  cy.get('.message.user', { timeout: 5000 }).should('contain', message).and('be.visible')
})