class UI {
  renderList = planes => {
    let html = '';
    const tbody = document.querySelector('#tbody');

    planes.forEach(plane => {
      html += `
      <tr>
        <td>${`${plane[1]}, ${plane[2]}`}</td>
        <td>${plane[3]}</td>
        <td>${plane[4]}</td>
        <td>${plane[5]}</td>
        <td>${plane[11]}</td>
        <td>${plane[12]}</td>
        <td>${plane[13]}</td>
        <td>${plane[plane.length - 1]}</td>
      </tr>  
      `;
    });

    tbody.innerHTML = html;
  };
}

class Store {
  fetchPlanes = async () => {
    try {
      const response = await fetch(
        'https://data-live.flightradar24.com/zones/fcgi/feed.js?bounds=56.84,55.27,33.48,41.48'
      );
      const planes = await response.json();
      return planes;
    } catch (err) {
      console.error(err);
    }
  };

  parsePlanes = data => {
    let planes = [];
    for (let key in data) {
      if (key !== 'full_count' && key !== 'version') {
        data[key].push(this.getDistance(data[key][1], data[key][2]));

        planes.push(data[key]);
      }
    }
    return planes;
  };

  getDistance = (lat2, lon2) => {
    const lat1 = 55.410307;
    const lon1 = 37.902451;
    const { deg2rad } = this;

    const R = 6371;
    let dLat = deg2rad(lat2 - lat1);
    let dLon = deg2rad(lon2 - lon1);
    let a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) *
        Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    let d = R * c;

    return d;
  };

  deg2rad = deg => {
    return deg * (Math.PI / 180);
  };

  sortByDistance = planes => {
    const sortedPlanes = [...planes];
    sortedPlanes.sort((a, b) => {
      return a[a.length - 1] - b[b.length - 1];
    });
    return sortedPlanes;
  };
}

(async () => {
  const store = new Store();
  const ui = new UI();

  const planes = await store.fetchPlanes();
  const parsedPlanes = store.parsePlanes(planes);
  const sortedPlanes = store.sortByDistance(parsedPlanes);
  ui.renderList(sortedPlanes);

  setInterval(async () => {
    const planes = await store.fetchPlanes();
    const parsedPlanes = store.parsePlanes(planes);
    const sortedPlanes = store.sortByDistance(parsedPlanes);
    ui.renderList(sortedPlanes);
  }, 3000);
})();
