# Floor Functions

Floor Functions simulates having layers on a single page by allowing tokens, maps, or lighting lines to be assigned to a named floor and then allowing the various floors to be manipulated via chat commands.

Basically, I find having to switch between pages annoying on Roll20. When you have, for example, a castle or inn that has multiple floors, you typically have to set up each floor on each own page and then drag the player marker to that page when you need to switch while also copying any tokens and setting up the situation. Your players also have to find where they are and figure out what's what.

This lets you overlay the floors on top of one another and then switch using chat commands. If there are stairs, just have your players set their token on the stairs and type !ffshow floor2 or whatever in the chat window and voila!, the floor will appear with the tokens positioned on the stairs leading up to that floor. As an added bonus, this can reduce the number of pages you need, thus making it easier to navigate the page menu.

There are, of course, downsides to using this method. Specifically:

- You need all players to switch floors simultaneously, which is almost always the case. Allowing players to move between pages individually can be a little frustrating using the built-in tools, anyway. I try to encourage the players to stick together without directly telling them to.
- It can potentially mess up advanced fog of war and revealed areas.
- Roll20 is rather slow by default and adding this much stuff to a single page can be resource-intensive.

## Commands

Command                | Description
---------------------  |------------
!ffhelp             | Display the help text
!ffinfo             | If an object is selected, displays the object's current floor and layer, otherwise displays a list of all floors
!ffadd&#160;floor_name&#160;[layer]       | Adds the selected objects to the specified floor on their current layer unless one is specified through the [layer] parameter (must be one of map, objects, gmlayer, or walls)
!ffremove           | Removes the selected tokens from all floors
!ffset&#160;floor_name   | brings the specified floor into view and hides all other floors
!ffshow&#160;floor_name   | brings the specified floor into view and to the front without hiding the current floor
!ffhide&#160;floor_name   | hides the specified floor
