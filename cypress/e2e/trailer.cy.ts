describe('Trailer', ()=>{
  it('should play trailer', () => {
    cy.visit('/');
    cy.get('app-clip-list').find('.grid').find('a').first().click();
    cy.get('.rounded').find('video').click();
    cy.wait(3000);
    cy.get('.video-js').click();
    cy.get('.vjs-play-progress').invoke('width').should('gte', 0);
  })
})
