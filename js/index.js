let map = L.map('map').setView([47.620540, -122.349246], 12);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

function getPrecinctResultsFromName(name) {
    return results.find(e => { return e.precinct == name; });
}

function getPrecinctColor(districtNumber) {
    if (districtNumber == 1) {
        return 'red';
    } else if (districtNumber == 2) {
        return 'orange';
    } else if (districtNumber == 3) {
        return 'darkkhaki';
    } else if (districtNumber == 4) {
        return 'green';
    } else if (districtNumber == 5) {
        return 'blue';
    } else if (districtNumber == 6) {
        return 'indigo';
    } else if (districtNumber == 7) {
        return 'violet';
    } else {
        return '#000';
    }
}

function getComplementColor(color) {
    return tinycolor(color).complement().toHexString();
}

function getCandidateColoring() {
    return {
        'Michael Bloomberg': '#bd4579',
        'John Delaney': '#1a80c4',
        'Tulsi Gabbard': '#82dcad',
        'Andrew Yang': '#6794ff',
        'Tom Steyer': '#e7c47e',
        'Deval Patrick': '#000',
        'Amy Klobuchar': '#31803d',
        'Bernie Sanders': '#3b99a7',
        'Joseph R. Biden': '#8357aa',
        'Michael Bennet': '#fff063',
        'Elizabeth Warren': '#e26e42',
        'Pete Buttigieg': '#ffb609',
        'Cory Booker': '#1a80c4',
        'Uncommitted Delegates': '#666'
    };
}

L.geoJSON(features, {
    onEachFeature: function(feature, layer) {
        let precinctName = feature.properties.NAME;
        let r = getPrecinctResultsFromName(precinctName);
        let districtRace = r.races.find(e => { return e.name.includes("President of the United States Democratic Party"); });
        if (districtRace === undefined) {
            return;
        }
        let html = '';
        districtRace.votes.sort((a, b) => {
            return a.votes < b.votes;
        });
        for (let i = 0; i < districtRace.votes.length; i++) {
            let item = districtRace.votes[i];
            html += `<p>${item.item}: ${item.votes}</p>`;
        }
        let popup = L.popup()
            .setContent(`<div><p>${precinctName}</p>${html}</div>`);
        layer.bindPopup(popup);
    },
    style: function(feature) {
        let precinctName = feature.properties.NAME;
        let r = getPrecinctResultsFromName(precinctName);
        let districtRace = r.races.find(e => { return e.name.includes("President of the United States Democratic Party"); });
        if (districtRace === undefined) {
            return;
        }
        let coloring = getCandidateColoring();
        let total = districtRace.total_votes;
        let topCandidate = null;
        for (let i = 0; i < districtRace.votes.length; i++) {
            let item = districtRace.votes[i];
            if (item.item == 'Write-in') {
                continue;
            }
            if (topCandidate == null) {
                topCandidate = {
                    name: item.item,
                    votes: item.votes
                };
            } else if (item.votes > topCandidate.votes) {
                topCandidate = {
                    name: item.item,
                    votes: item.votes
                };
            }
        }
        return {
            fillColor: coloring[topCandidate.name],
            fillOpacity: topCandidate.votes / total,
            weight: 2,
            color: getPrecinctColor(r.district_number),
            dashArray: 5
        };
    }
}).addTo(map);
