(function() {
	'use strict';

	L.Routing = L.Routing || {};

	L.Routing.Line = L.LayerGroup.extend({
		includes: L.Mixin.Events,

		options: {
			styles: [
				{color: 'black', opacity: 0.15, weight: 7},
				{color: 'white', opacity: 0.8, weight: 4},
				{color: 'orange', opacity: 1, weight: 2}
			],
			addWaypoints: true
		},

		initialize: function(route, options) {
			var geom = route.coordinates,
			    i,
			    pl;

			L.setOptions(this, options);
			L.LayerGroup.prototype.initialize.call(this, options);
			this._route = route;

			this._wpIndices = this._findWaypointIndices();

			for (i = 0; i < this.options.styles.length; i++) {
				pl = L.polyline(geom, this.options.styles[i]);
				this.addLayer(pl);
				if (this.options.addWaypoints) {
					pl.on('mousedown', this._onLineTouched, this);
				}
			}
		},

		addTo: function(map) {
			map.addLayer(this);
			return this;
		},
		getBounds: function() {
			return L.latLngBounds(this._route.coordinates);
		},

		_findWaypointIndices: function() {
			var wps = this._route.waypoints,
			    indices = [],
			    i;
			for (i = 0; i < wps.length; i++) {
				indices.push(this._findClosestRoutePoint(L.latLng(wps[i])));
			}

			return indices;
		},

		_findClosestRoutePoint: function(latlng) {
			var minDist = Number.MAX_VALUE,
				minIndex,
			    i,
			    d;

			for (i = this._route.coordinates.length - 1; i >= 0 ; i--) {
				// TODO: maybe do this in pixel space instead?
				d = latlng.distanceTo(this._route.coordinates[i]);
				if (d < minDist) {
					minIndex = i;
					minDist = d;
				}
			}

			return minIndex;
		},

		_findNearestWpBefore: function(i) {
			var j = this._wpIndices.length - 1;
			while (j >= 0 && this._wpIndices[j] > i) {
				j--;
			}

			return j;
		},

		_onLineTouched: function(e) {
			var afterIndex = this._findNearestWpBefore(this._findClosestRoutePoint(e.latlng));
			this.fire('linetouched', {
				afterIndex: afterIndex,
				latlng: e.latlng
			});
		},
	});

	L.Routing.line = function(route, options) {
		return new L.Routing.Line(route, options);
	};
})();
