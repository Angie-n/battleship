Battleships

A site for playing the popular game Battleships, where users set up their board and attempt to sink all of their opponent’s ships.

## Installation and Setup Instructions


Clone this repository


Installation:


`npm install`  


To Visit App:


`localhost:3000`  


## Reflection


In order to practice testing using jest, I created this site and then tested game board positioning and potential actions from the bot and player. 


The bot has a semi-smart strategy in playing the game, trying all adjacent squares when landing a hit until another is found and also avoiding squares surrounding an already sunk ship (since ships aren’t able to be placed directly next to each other). However, the bot currently does not keep track of ship lengths, leading to inefficient shots in areas that the remaining ships may not be able to fit into. 


A challenge I faced while creating the app was implementing an intuitive way for users to position their ships. I decided to use the HTML Drag and Drop API, which (while limited on mobile) allows users to drag HTML elements and place them within other elements. I also used mouse events to make it clear which positions were possible as well as highlight the current location of the drop. 
