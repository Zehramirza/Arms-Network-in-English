/ ISIS is a name from the Dope Wars game
var isis = function() {
  
  // Define a bunch of variables without any values
  var _game, _items, _cities;
  var $_cities, $_cityTitle, $_items, $_inventory, $_codename, $_agentName, $_agentRank;
  var Agent, City, Game;

  // Prompt user for a valid num and return it
  function promptForNumber(message)
  {
    var num;      //a variable "num" is declared
    do {
      //prompts user for a number
      num = prompt(message);    
    } while (isNaN(num) || num == "");
    //continue to prompt until a number is entered
    //checks to see if num is a string or its empty 

    //return the value of "num" once the number is entered
    return num;           
  }

  // Return a random integer between the given min and max
  //Math.random() selects a random value between 0 and 1
  //Number of values to select from is determined by (max - min + 1)
  //The actual range of values to select from is determined by adding min
  //Math.floor() rounds down the value to an integer  
  //(which falls in our desired range)
  function getRandomIntInRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  // Return a HTML button for a city
  function createButtonForCity(city) {
    var $button = $("<button>");
    //creating a variable button in js but putting it in html as a string
    $button.attr('data-city', city);
    $button.text('Travel Here');
    $button.addClass('btn');

    return $button;
  }

  // Return a HTML button for an item
  // and bind a click event to the button
  function createButtonForItem(item) {
    var $buy;
    $buy = $("<button>");
    $buy.attr('data-item', item);
    $buy.text('Buy');
    $buy.addClass('btn');

    // On click the item is bought and the views are refreshed
    $buy.click(function() {
      var item = $(this).data('item');
      item = _game.currentCity.items[item];

      console.log("The item going in is: "); 
      //item clicked by user is printed within the string using console.log below
      console.log(item);

      _game.buyItem(item);
      _game.refreshViews();
    });

    return $buy;
  }

  // Return a random subset of the given items
  // with the size of the subset given
  //items: array of items, numberOfItems: the length of the desired subset
  function sample(items, numberOfItems) {
    //create a new empty array (subset)
    var sampleOfItems = [];

    do {
      var item;

      //item is undefined

      // Keep randomly selecting an item until the item
      // is not the last one added to the sample
      do {
        var num = Math.floor(Math.random() * items.length);
        //Math.random() selects a random value from 0 to 1
        //multiplying the random value to the length of the array
        //then rounding it down to get the position in the array
        item = items[num];
        //"item" now holds the element in the index position from the original array ("items")
      } while (sampleOfItems.lastIndexOf(item) !== -1)
      //essentially checks if sampleOfItems array already holds this item.
      //if not, exits the loop. If it does, loop again and randomly select
      //another item

      sampleOfItems.push(item);
      //adds the new item to the sampleOfItems array

    } while (sampleOfItems.length !== numberOfItems);
    //loops until the number of elements in sampleOfItems matches
    //the desired length of the subset (numberOfItems)

    return sampleOfItems;
  }

  // Set the DOM elements for the cities
  function printCities(currentCity) {
    $_cities.text('');
    $_cityTitle.text(currentCity.name);

    for (i in _cities) {
      var $row, $span, $city, $button, city;
      city = _cities[i];
      $row = $('<tr>');
      $city = $('<td>').addClass('city span3');
      $button = createButtonForCity(i);
      $button.addClass('span3');

      if (city !== currentCity) {
        $button.addClass('btn-primary');
        $button.click(function() {
          var city = $(this).data('city')
          city = _cities[city];

          _game.changeCity(city);
          _game.rollDieForBadThing();
          _game.refreshViews();
        });
      } else {
        $button.text('You are here!');
        $button.addClass('btn-warning disabled');
      }

      $city.text(city.name);

      $row.append($city);
      $row.append($('<td>').append($button));
      $_cities.append($row);
    }
  }

  // Set the DOM elements for currentCity's items
  function printItems(currentCity) {
    $_items.text('');

    for (k in currentCity.items) {
      var v, items, $row, $item, $value, $buttonGroup;
      items = currentCity.items;
      $row = $('<tr>')
      $item = $('<td>').addClass('item span4');
      $buttonGroup = $('<td>').addClass('buttons span1');
      $value = $('<td>').addClass('value span1');
      v = items[k];

      $buttonGroup.append(createButtonForItem(k));

      $item.text(v.name);
      $value.text('$' + v.currentPrice);

      $row.append($item);
      $row.append($value);
      $row.append($buttonGroup);

      $_items.append($row);
    }
  }

  // Set the DOM elements for the agent's inventory
  function printInventory(inventory, currentCityItems) {
    $_inventory.text('');

    for (k in inventory) {
      var v, itemValue, worth, $row, $sell, $item, $buttonGroup;

      v = inventory[k];
      itemValue = v.quantity * v.item.currentPrice;
      worth = '';
      $row = $('<tr>');
      $item = $('<td>').addClass('span4 item');
      $buttonGroup = $('<td>').addClass('buttons span2');

      if (currentCityItems.indexOf(v.item) > 0) {
        $sell = $("<button>");
        $sell.attr('data-item', k);
        $sell.text('Sell');
        $sell.addClass('btn');

        $sell.click(function() {
          var item = $(this).data('item');
          item = _game.agent.getInventoryItem(item);

          _game.sellItem(item);
          _game.refreshViews();
        });

        $buttonGroup.append($sell);

        worth = ', worth: $' + itemValue;
      }

      $item.text(v.item.name + '(' + v.quantity + ')' + worth);

      $row.append($item);
      $row.append($buttonGroup);

      $_inventory.append($row);
    }
  }

  // Set the text of the DOM elements for the agent's profile
  function printProfile(agent) {
    $_codename.text(agent.codename);
    $_agentName.text(agent.name);
    $_agentRank.text(agent.getRank());
    $_money.text('$' + agent.money);
  }

  // Initialize a new Item with a given name, minPrice, and maxPrice
  // and set currentPrice with recalculatePrice()
  //Object "Item" that has the following properties
  //name, minPrice, maxPrice, a function called recalculatePrice()
  Item = function(name, minPrice, maxPrice) {
    this.name     = name;
    this.minPrice = minPrice;
    this.maxPrice = maxPrice;
    this.recalculatePrice();
  }

  // Randomly set currentPrice of Item between said Item's minPrice and maxPrice
  //defining the function recalculatePrice() for the Object "Item"
  //randomly selects a value (using the function mentioned above)
  // between the min and max price
  //and sets the current price to that
  Item.prototype.recalculatePrice = function () {
    this.currentPrice = getRandomIntInRange(this.minPrice, this.maxPrice);
  }

  // Initialize an array of Items
  //list of 7 "Item" objects
  _items = [
    // new Item(name, minPrice, maxPrice)
   /*[0]*/ new Item('M4A1', 250, 500),
   /*[1]*/ new Item('TEC-9', 100, 250),
   /*[2]*/ new Item('.44 Magnum', 350, 500),
   /*[3]*/ new Item('Barret .50 cal', 1000, 1500),
   /*[4]*/ new Item('9mm Ammo', 5, 25),
   /*[5]*/ new Item('.50 cal Ammo', 100, 150),
   /*[6]*/ new Item('.44 Magnum Ammo', 35, 50)
  ];

  // Initialize a new City with a given name and give it a random number of random Items
  //object "City" with the following properties: name, numOfItems(random number selected using function above), items (subset of all items)
  City = function(name) {
    this.name = name;
//creates a new instance of the city name
    this._numOfItems = getRandomIntInRange(3, _items.length);
    this.items = sample(_items, this._numOfItems);
  }

  // Initialize an array of Cities
  //list of 7 "City" objects
  _cities = [
  /*[0]*/  new City('Toronto'),
  /*[1]*/  new City('New York'),
  /*[2]*/  new City('San Francisco'),
  /*[3]*/  new City('London'),
  /*[4]*/  new City('Hong Kong'),
  /*[5]*/  new City('Moscow'),
  /*[6]*/  new City('Sydney')
  ];

  // Initialize Game with an array of Cities,
  // a random currentCity, a new Agent, 
  // badThings, and then refresh the views
  //Object "Game" with the following properties: cities, currentCity, badThings, agent, functions initBadThings() and refreshViews()
  Game = function() {
    this.cities = _cities;
    this.currentCity = _cities[getRandomIntInRange(0, _cities.length - 1)];
    this.badThings = [];

    this.agent = new Agent();
    this.initBadThings(this.badThings);

    this.refreshViews();
  }

  // Update what is displayed visually on the screen
  //defines what refreshViews() does
  //uses 4 of the functions mentioned above to refresh the webpage
  Game.prototype.refreshViews = function() {
    printCities(this.currentCity);

    // Print the items for the currentCity
    printItems(this.currentCity);

    // Print the inventory the agent has for the currentCity
    printInventory(this.agent.inventory, this.currentCity.items);

    // Print the agent's profile
    printProfile(this.agent);
  }

  // Change the currentCity to the given city and then refresh the views
  //function changeCity() that outputs agent wanting to change the city
  //and changes the value of currentCity to newCity
  //and then refreshes the view of the webpage
  Game.prototype.changeCity = function(newCity) {
    console.log(this.agent.name + ' is trying to change city to ' + newCity.name);
    this.currentCity = newCity;
    this.refreshViews();
  }

  // Return true/false based on if a random number between 1 and 10 equals 1
  //random number selected between 1 and 10. If 1 is rolled, "bad things happen"
  Game.prototype.badThing = function() {
    var roll = getRandomIntInRange(1, 10);
    console.log('rolled ' + roll);
    if (roll === 1) {
      return true;
    } else {
      return false;
    }
  }

  // Randomly select a bad thing and apply its effects to this game's agent
  // randomly selects an index between 1 and length of the array
  // and outputs a message, commits the bad thing
  Game.prototype.makeBadThingHappen = function() {
    var index = getRandomIntInRange(1, this.badThings.length) - 1;
    var badThing = this.badThings[index];
    console.log('Going to do: ' + badThing.name);
    badThing.ohNoes(this.agent);
    console.log('Bad thing done!');
  }

  // Roll a die to see if a bad thing should happen and if so make it happen
  // call the above mentioned functions. if 1 is rolled, agent will do a bad thing
  // otherwise nothing bad happens
  Game.prototype.rollDieForBadThing = function () {
    if (_game.badThing()) {
      _game.makeBadThingHappen();
    } else {
      alert("Nothing bad happened!\nPhew!");
    }
  }

  // Function called when buy is clicked for an item
  Game.prototype.buyItem = function(item) {
    var invalid = true;


    // While invalid is true
    //essentially loops through until a valid integer is entered for the quantity
    while (invalid) {
      // Prompt user for a number for qty
      var qty = promptForNumber("How many of " + item.name + " do you want?")
      if (qty < 1) {
        // If qty is less than 1, alert user to enter in a valid number
        alert("Please enter in a number greater than 0.");
      } else {
        // Else change invalid to false and break while loop
        invalid = false;
      }
    }

    //calculates the total cost of the item
    var amount = item.currentPrice * qty;


    //if agent cannot afford the cost, it outputs a message
    //and exits the function
    if (!this.agent.canAfford(amount)) {
      alert("You can't afford $" + amount + ".")
      // return; ends function and the rest of the code is not run
      return; 
    }


    //this stage means the agent CAN afford the items
    //outputs a message asking to confirm purchase
    var yes = confirm("Please confirm you want " + qty + " of " + 
      item.name + " for $" + amount);

    //if agent confirms, then money is spent to purchase the items
    //and the items are added to the agent's inventory
    if (yes) {
      this.agent.spendMoney(amount);
      this.agent.buyItem(item, qty);
    }

    //refresh the webpage with the updated values
    this.refreshViews();
  }

  // Function called when sell is clicked for an item
  Game.prototype.sellItem = function(inventoryItem) {

    //calculates the total value of a certain inventoryItem (current price x quantity)
    var value = inventoryItem.item.currentPrice * inventoryItem.quantity;

    //outputs to the screen the name of the item and the quantity as well as the total value
    console.log('Trying to sell ' + inventoryItem.item.name + ', I have ' + inventoryItem.quantity + ' worth $' + value);

    var invalid = true;

    // While invalid is true
    // keeps prompting the user to enter the quantity of the inventory item he/she wishes to sell
    // cannot be less than 0 or exceed the quantity in hand
    while (invalid) {
      // Prompt user for a number for qty
      var qty = promptForNumber("How many of " + inventoryItem.item.name + " do you want to sell?")
      if (qty < 1) {
        alert("Please enter a number 1 or greater");
      }
      else if (qty > inventoryItem.quantity) {
        alert("You only have " + inventoryItem.quantity);
      }
      else {
        // Only change invalid to false and break loop if qty meets conditions
        invalid = false;
      }
    }

    //amount is set to the quantity x currentPrice of the inventoryItem
    //calls functions sellItem() and earnMoney(), which are associated with the agent
    //refreshes the page
    var amount = qty * inventoryItem.item.currentPrice;
    this.agent.sellItem(inventoryItem.item, qty);
    this.agent.earnMoney(amount);

    this.refreshViews();
  }

  // Add four bad things to the empty array being given called badThings
  // Each bad thing has a name, and a function of what happens called ohNoes
  //initializes the badThings[] with 4 different "bad things" along with their ohNoes()
  //which defines the actions taken
  Game.prototype.initBadThings = function(badThings) {
    badThings.push({
      name: "Custom fare hike",
      ohNoes: function(agent) {
        alert("You got busted carrying cash through customs. You had to pay a 5% tax.");
        agent.money = agent.money * .95;
        alert("You lost a decent chunk");
      }
    });
    
    badThings.push({
      name: "Search & seizure",
      ohNoes: function(agent) {
        alert("The police said you fit a profile. You got searched, and they seized!");
        agent.money -= 100;
        alert("You lost 100 bucks");
      }
    });

    badThings.push({
      name: "Feeling the pressure",
      ohNoes: function(agent) {
        alert("You couldn't take the pressure of carrying around all that cash. You ordered bottle service at the club and got wasted.");
        agent.money -= 100;
        alert("You lost 100 bucks");
      }
    });

    badThings.push({
      name: "You got jumped",
      ohNoes: function(agent) {
        alert("You got jumped by a rival cartel member. They shook you down.");
        agent.money -= 50;
        alert("You lost 50 bucks");
      }
    })
  }

  // Initialize a new AgentItem with a given item and quantity
  // object "AgentItem" has the following properties: item, quantity
  AgentItem = function(item, quantity) {
    this.item = item;
    this.quantity = quantity;
  }

  // Initialize a new Agent, give it money, an empty inventory,
  // and call init
  //object "Agent" that has the following properties: money, inventory[], init()
  Agent = function() {
    this.money = 1000;
    this.inventory = [];

    this.init();
  }

  // Prompt the user for a name and a codename for the agent
  Agent.prototype.init = function(item) { 
    this.name = prompt("What is your name, agent?");
    this.codename = prompt("And your codename?");
  }

  // Return the the given index of the inventory which will be an item
  Agent.prototype.getInventoryItem = function(index) {
    return this.inventory[index];
  }

  // Find the given item in the inventory and return it
  // agent checks his/her inventory list to see if he/she has "item_to_find"
  // if the agent has the item, return that item back to the caller
  Agent.prototype.findItem = function(item_to_find) {
    for (var i in this.inventory) {
      var v = this.inventory[i];
      if (v.item === item_to_find) {
        return v;
      }
    }
  }

  // Increment an item's quantity in the agent's inventory
  // by a given "quantity", if the agent already has the item in their inventory
  // If the item is not found in the inventory, create it, and add it to the inventory[]
  Agent.prototype.buyItem = function(item, quantity) {
    var found_item = this.findItem(item);
    if (found_item) {
      found_item.quantity += quantity;
    } else {
      item = new AgentItem(item, quantity);
      this.inventory.push(item);
    }
  }

  // Reduce an item's quantity in the agent's inventory
  // by a given number
  //
  Agent.prototype.sellItem = function(item, quantity) {
    // Find the item in the invetory
    var found_item = this.findItem(item);
    // If the item was found...
    if (found_item) {
      // ...and the quantity of the item exceeds the given quantity...
      if (found_item.quantity - quantity < 0) {
        // ...throw an error.
        throw 'Cannot remove that much: ' + quantity;
      } 
      // Or if all of the items are sold...
      else if (found_item.quantity - quantity === 0) {
        // Remove it from the inventory.
        var index = this.inventory.indexOf(i);
        this.inventory.splice(index, 1);
      } 
      // Otherwise decrement the item's quantity by the given quantity.
      else {
        found_item.quantity -= quantity;
      }
    } 
    // Else if the item was not found, throw an error.
    else {
      throw 'Item not found in Inventory: ' + i.item.name;
    }
  }

  // Return ranks based on how much money the agent has
  Agent.prototype.getRank = function() { 
    if (this.money < 500)
      return "Rookie";
    if (this.money < 1000)
      return "Agent";
    if (this.money < 5000)
      return "Top Agent";
    if (this.money >= 5000)
      return "Double-0";
  }

  // Return true/false based on if the agent has money 
  // greater than or equal to the given amount
  Agent.prototype.canAfford = function(amount) {
    return this.money >= amount;
  };

  // Decrement the agent's money by the given amount
  Agent.prototype.spendMoney = function(amount) {
    if (this.canAfford(amount))
      this.money -= amount;
  };

  // Increment the agent's money by the given amount
  Agent.prototype.earnMoney = function(amount) {
    this.money += amount;
  };

  // Return init, debug, Agent, AgentItem, Item, City, and Game
  // in the namescope of isis
  //
  // This means in the console in Chrome you can type:
  // isis.init(), isis.debug(), isis.Agent, isis.AgentItem, 
  // isis.Item, isis.City, and isis.Game
  //
  // (Parentheses are after init and debug because they're functions)
  return {
    init: function() {
      $_cities    = $('#cities');
      $_items     = $('#items');
      $_cityTitle = $('#currentCity');
      $_inventory = $('#inventory');
      $_codename  = $('#codename');
      $_agentName = $('#agentName');
      $_agentRank = $('#agentRank');
      $_money     = $('#agentMoney');
      _game       = new Game();
    },

    game: _game,

    debug: function() {
      return _game;
    },

    Agent:     Agent,
    AgentItem: AgentItem,
    Item:      Item,
    City:      City,
    Game:      Game
  }
}();
// If you're curious about the parentheses in the previous line read this:
// http://markdalgleish.com/2011/03/self-executing-anonymous-functions/

// Call the init function and unleash the hounds!
isis.init();