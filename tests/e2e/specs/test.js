// https://docs.cypress.io/api/introduction/api.html

describe('Test example', () => {
  it('Home page should have a search button', () => {
    cy.visit('/');
    cy.contains('button', 'Search');
  });
});
