describe('Trailers app test', () => {
  it('Sanity test', () => {
      cy.visit('/');
      cy.contains('#header .text-3xl', 'TRAILERS')
  })
})
