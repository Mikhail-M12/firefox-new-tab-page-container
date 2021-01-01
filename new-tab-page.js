var colors = {
  blue: "#37adff",
  turquoise: "#00c79a",
  green: "#51cd00",
  yellow: "#ffcb00",
  orange: "#ff9f00",
  red: "#ff613d",
  pink: "#ff4bda",
  purple: "#af51f5",
  toolbar: "#000000",
}

function eventHandler(event) {
  let target = event.target;
  if (target.className !== "tile") {
    target = target.closest('.tile');
  }
  if (true) {
    browser.tabs.getCurrent().then((tabInfo) => {
      browser.tabs.create({
        cookieStoreId: target.dataset.identity, index: (tabInfo.index+1)
      });
      browser.tabs.remove(tabInfo.id);
    }, () => {
      console.log('error');
    });
    event.preventDefault();
    event.stopPropagation();
  }
}

function attachAction(tile, identity) {
  tile.dataset.identity = identity.cookieStoreId;
  tile.dataset.name = identity.name;
  tile.dataset.color = identity.color;
  tile.dataset.icon = identity.icon;
  tile.dataset.toggle = "modal";
  tile.dataset.target = "#containerModal";
  tile.addEventListener('click', eventHandler);
}

function createTile(identity) {
  let tile = document.createElement('div');
  tile.className = "tile";

  let content = document.createElement('div');
  content.className = "content";

  let icon = document.createElement('div');
  icon.className = "icon";

  let img = document.createElement('img');
  img.src = identity.iconUrl;

  icon.appendChild(img);

  content.appendChild(icon);

  let title = document.createElement('div');
  title.className = "title";
  title.appendChild(document.createTextNode(identity.name));

  content.appendChild(title);
  tile.appendChild(content);

  tile.style = `background-color: `+ colors[identity.color];

  attachAction(tile, identity);

  return tile;
}

var divTiles = document.getElementById('tile-group');

if (browser.contextualIdentities === undefined) {
  divTiles.innerText = 'browser.contextualIdentities not available. Check that the privacy.userContext.enabled pref is set to true, and reload the add-on.';
} else {
  browser.contextualIdentities.query({})
  .then((identities) => {
    identitiesLength = identities.length;
    if (!identities.length) {
      divTiles.innerText = 'No identities returned from the API.';
      return;
    }

    for (let identity of identities) {
      let tile = createTile(identity);
      divTiles.appendChild(tile);
    }
    let defidentity = identities[0];
    defidentity.cookieStoreId = "";
    defidentity.name="No container";
    defidentity.icon="";
    defidentity.iconUrl="";
    let deftile = createTile(defidentity);
    deftile.style = `background-color: grey`;
    divTiles.appendChild(deftile);

    window.addEventListener('resize', updateWidth);
    updateWidth();
  });
}

var identitiesLength = 0;

var updateWidth = () => {
  let nbElem = Math.floor((document.documentElement.clientWidth - 40) / 254);
  divTiles.style.width = (nbElem * 254) + 'px';
}

var search = document.getElementById('search');

var performSearch = function() {
  let searchVal = search.value;
  browser.tabs.getCurrent().then((tabInfo) => {
    browser.search.search({
      query: searchVal,
      tabId: tabInfo.id,
    });
  });
}
search.addEventListener('keyup', function(event) {
  let value = search.value;
  if (value) {
    value = value.toLowerCase().trim();
  }
  let elements = document.getElementsByClassName('tile');
  for (let elem of elements) {
    let name = elem.dataset.name;
    if (search.length === 0 || (name && name.toLowerCase().trim().includes(value))) {
      elem.style.display = null;
    } else {
      elem.style.display = 'none';
    }
  }
});

document.getElementById('searchBtn', performSearch);
