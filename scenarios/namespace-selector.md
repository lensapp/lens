## Feature: Namespace-selector in "cluster frame"

### Scenario: Options for namespaces
- Given I’m connected to a cluster for the first time
- And I see the Namespace selector somewhere
- When I mouse-click to select it
- Then I see a list of all the Namespaces in alphabetical order
- But a selection for "All namespaces" as first

### Scenario: Selecting a single namespace with mouse
- Given I’ve opened namespace selector
- When I hover over a namespace
- Then a toggle appears next to the namespace
- When I click the namespace entry outside of the toggle
- Then the list of namespaces closes
- And the namespace is seen as selected
- When I reopen the list
- Then I see the selected namespace at the top, just below "All namespaces"
- And I see the namespace marked as selected
- And I see the remaining namespaces in previous order not marked as selected

### Scenario: Selecting All Namespaces option explicitly
- Given I’ve opened namespace selector
- When I click the "All Namespaces" option
- Then I see just the "All Namespaces" option as selected

### Scenario: Toggling a single namespace after selecting "All Namespaces" option explicitly
- Given I’ve opened namespace selector
- And the "All Namespaces" option is selected
- And the CTRL/CMD is pressed
- When I click a single namespace option
- Then the "All Namespaces" option is shown as not selected
- And that single namespace is shown as not selected
- And all other single namespace options are shown as selected

### Scenario: Selecting all namespace options explicitly
- Given I’ve opened namespace selector
- When I have selected each of the individual namespace options
- Then the "All Namespaces" option is not shown as selected
- And then every namespace option is shown as selected
- When a new namespace appears
- Then that new namespace is not shown as selected

### Scenario: An single explicitly selected namespace is deleted
- Given that a single namespace is selected
- When that namespace is deleted
- Then the "All Namespaces" option is selected
- When a new namespace with the same name is created
- The "All Namespaces" is still the option selected

### Scenario: One of several explicitly selected namespaces is deleted
- Given that more than one namespaces are selected
- When one of those namespace is deleted
- Then the remaining namespaces are shown as selected
- When a new namespace with the same name is created
- Then that new namespace is shown as selected

### Scenario: Selecting a different single namespace with mouse
- Given I’ve opened namespace selector
- And I have a single namespace selected
- When I select a different namespace with a mouse-click
- Then the list of namespaces closes
- And the namespace is seen as selected in the select control

### Scenario: Toggling multiple namespaces with mouse
- Given I’ve opened namespace selector
- When I hover over a namespace that isn't selected
- Then a toggle appears next to only that namespace
- When I hover over a namespace that is selected
- Then a toggle replaces the selection marker next to only that namespace
- When I click the checkbox
- Then the list of namespaces does not close
- And the namespace is still seen in original order
- But the namespace is marked as selected
- When I click the select control the namespace selector closes

### Scenario: Selecting single namespace after multiple namespaces with mouse
- Given I’ve opened namespace selector
- When I hover over a namespace
- Then a checkbox appears next to only that namespace
- When I click the checkbox
- Then the list of namespaces does not close
- And the namespace is still seen in original order
- But the namespace is marked as selected
- When I click any namespace
- Then the list of namespaces closes
- And the namespace is seen as selected in the select control

### Scenario: Selecting multiple namespaces with CTRL/CMD and mouse
- Given I’ve opened namespace selector
- And CTRL/CMD is pressed
- When I hover a namespace
- Then a checkbox does not appear next to the namespace
- When I click the namespace anywhere
- Then the list of namespaces does not close
- And the namespace is still seen in original order
- But the namespace is marked as selected
- When I click the select control the namespace selector closes

### Scenario: A new namespace is created while the selector is open
- Given that the namespace selector is open
- And a new namespace is created
- Then new namespace is now visible as an option
- And the new namespace is not shown as selected
- And the namespace is sorted alphabetically into the "never selected" section

### Scenario: A non-selected namespace is deleted while the selector is open
- Given that the namespace selector is open
- And a namespace that is not selected is deleted
- Then the namespace is no longer visible as an option

### Scenario: Closing dropdown after selecting multiple namespaces onKeyUp CTRL/CMD and mouse
- Given I’ve opened namespace selector
- And CTRL/CMD is pressed
- When I release CTRL/CMD key
- Then the namespace selector closes

### Scenario: Closing the namespace selector with outside mouse click
- Given I’ve opened namespace selector
- When I click outside the selector the namespace selector closes

### Scenario: Reopening namespace selection shows selections first
- Given I’ve already selected namespaces
- When I reopen namespace selector
- Then I see the selected namespaces at the top in alphabetical order, just below "All namespaces"
- And then I see the namespaces that I have ever selected in MRU order
- And then I see the namespaces that I have never selected in alphabetical order

### Scenario: Default namespace is preselected when present
- Given this is the first time connecting to a cluster
- And a special namespace called "default" is among the namespaces
- Then "default" is selected instead of "All namespaces"

### Scenario: All namespace is preselected when default is not present
- Given this is the first time connecting to a cluster
- And a special namespace called "default" is not among the namespaces
- Then "All namespaces" is selected

### Scenario: Focusing namespace selector using keyboard
- Given that I have just opened page with the namespace selector
- Can press TAB
- Then focuses the namespace selector

### Scenario: Opening namespace selector using keyboard
- Given that the namespace selector is focused and is closed
- Pressing the ENTER key
- Opens the namespace selector

### Scenario: Closing namespace selector using keyboard
- Given that the namespace selector control is focused and the dropdown is open
- Pressing the ENTER key
- Closes the namespace selector

### Scenario: Closing namespace selector using keyboard
- Given that the namespace selector is open and either the control or the dropdown is focuses
- Pressing the ESC key
- Closes the namespace selector

### Scenario: Moving focus through namespace selector dropdown using the keyboard
- Given that the namespace selector is open and is focused
- Regardless of CTRL/CMD press state
- Pressing the DOWN-ARROW moves to the next option in the dropdown, without wrapping around, being sticky
- Pressing the UP-ARROW moves to the previous option in the dropdown, without wrapping around, being sticky
- Pressing the PAGE-DOWN moves to the bottom of the dropdown
- Pressing the PAGE-UP moves to the top of the dropdown

### Scenario: Toggling namespace as selected using the keyboard
- Given that the namespace selector is open and is focused
- And that a namespace option is focused
- Pressing SPACE toggles the namespace as selected
- And the namespace selector closes

### Scenario: Toggling multiple namespace as selected using the keyboard
- Given that the namespace selector is open and is focused
- And the CTRL/CMD is pressed
- And that a namespace option is focused
- Pressing SPACE toggles the namespace as selected
- And the namespace selector stays open

### Scenario: Selecting a single namespace as selected using the keyboard
- Given that the namespace selector is open and is focused
- And that a namespace option is focused
- Pressing ENTER selects that single namespace
- And the namespace selector closes

### Scenario: Filtering list of namespaces
- Given that the namespace selector is open and is focused
- Typing filters the visible namespace options in the dropdown via contains
- Focus returns to the filter text input field

### Scenario: Toggling the first option after filtering list of namespace
- Given that the namespace selector is open, focused, and some filtering has been done
- Pressing ENTER toggles the first namespace option
- And the namespace selector closes

### Scenario: Selecting multiple options after filtering list of namespace
- Given that the namespace selector is open, focused, and some filtering has been done
- And the CTRL/CMD is pressed
- And not all the visible options are selected
- Pressing ENTER selects all the visible namespace options
- And the namespace selector stays open

### Scenario: Deselecting multiple options after filtering list of namespace
- Given that the namespace selector is open, focused, and some filtering has been done
- And the CTRL/CMD is pressed
- And all the visible options are selected
- Pressing ENTER deselects all the visible namespace options
- And the namespace selector stays open
