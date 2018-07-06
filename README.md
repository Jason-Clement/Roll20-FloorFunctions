# Floor Functions

Floor Functions simulates having layers by allowing tokens, maps, or lighting lines to be assigned to a named floor and then allowing the various floors to be manipulated via chat commands.

## Commands

Command                | Description
---------------------  |------------
!ffhelp             | Display the help text
!ffinfo             | If an object is selected, displays the object's current floor and layer, otherwise displays a list of all floors
!ffadd&#160;[layer]       | Adds the selected objects to the specified floor on their current layer unless one is specified through the [layer] parameter (must be one of map, objects, gmlayer, or walls)
!ffremove           | Removes the selected tokens from all floors
!ffset&#160;floor_name   | brings the specified floor into view and hides all other floors
!ffshow&#160;floor_name   | brings the specified floor into view and to the front without hiding the current floor
!ffhide&#160;floor_name   | hides the specified floor
