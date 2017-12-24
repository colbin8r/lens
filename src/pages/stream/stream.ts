import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';

import wiki from 'wikijs';
const wikipedia = wiki();

import Promise from 'bluebird';
import * as changeCase from 'change-case';
// import changeCase from 'change-case';

// import { LocationsProvider } from '../../providers/locations/locations';

declare var google;

enum DataOrigin {
  Google = 'google',
  Wikipedia = 'wikipedia'
}

/**
 * Generated class for the StreamPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-stream',
  templateUrl: 'stream.html',
})
export class StreamPage {

  public readonly searchRadius = 10000; // search radius in meters (max 50,000)

  private placesService;
  private nearbySearchAsync;
  private getDetailsAsync;

  private locations: Array<any>;

  private lat: number;
  private lng: number;

  constructor(public navCtrl: NavController, public navParams: NavParams, public geolocation: Geolocation) {
    // http://bluebirdjs.com/docs/api/promise.promisifyall.html
    // Promise.promisifyAll(google.maps.places.PlacesService);
    this.placesService = new google.maps.places.PlacesService(document.createElement('div'));
    this.nearbySearchAsync = Promise.promisify((request, callback) => this.placesService.nearbySearch(request, callback.bind(undefined, undefined)));
    this.getDetailsAsync = Promise.promisify((request, callback) => this.placesService.getDetails(request, callback.bind(undefined, undefined)));
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad StreamPage');
    this.locate().then(() => {
      Promise.all([this.getLocationsGoogle(), this.getLocationsWikipedia()]).then(([googleLocations, wikipediaLocations]) => {
        return googleLocations.concat(wikipediaLocations);
      }).then((locations) => {
        this.locations = locations;
      });
    });
  }

  getIconNameFromDataOrigin(origin: DataOrigin) {
    switch (origin) {
      case DataOrigin.Google:
        return 'logo-google';
      case DataOrigin.Wikipedia:
        return 'link';
      default:
        return 'open';
    }
  }

  openExternalURL(url: string) {
    console.log('Opening external URL', url);
    window.open(url, '_blank');
  }

  locate() {
    return this.geolocation.getCurrentPosition().then((resp) => {
      this.lat = resp.coords.latitude;
      this.lng = resp.coords.longitude;
      // more info available on the resp object
    }).catch((error) => {
      console.log('Error getting location', error);
    });
  }

  getLocationsGoogle(): Promise {
    return this.searchNearbyGoogle().then((results) => {
      return this.enhanceResultsGoogle(this.limitResults(results));
    });
  }

  getLocationsWikipedia(): Promise {
    return this.searchNearbyWikipedia().then((titles) => {
      return this.enhanceResultsWikipedia(this.limitResults(titles));
    });
  }

  searchNearbyGoogle(): Promise {
    return this.nearbySearchAsync({
      location: new google.maps.LatLng(this.lat, this.lng),
      radius: this.searchRadius
    });
  }

  searchNearbyWikipedia(): Promise {
    return wikipedia.geoSearch(this.lat, this.lng, this.searchRadius);
  }

  limitResults(results): Array<any> {
    return results.slice(0, 5);
  }

  enhanceResultsGoogle(results): Promise {
    let promises: Array<Promise> = [];
    results.forEach((result) => {
      promises.push(this.getDetailsAsync({
        placeId: result.place_id
      }));
    })
    return Promise.all(promises).then((enhancedResults) => {
      return enhancedResults.map((r) => {
        // add a photo preview
        if (r.photos) {
          r.image = r.photos[0].getUrl({
            maxHeight: r.photos[0].height,
            maxWidth: r.photos[0].width,
          });
        }

        // add a single type
        if (r.types && r.types.length > 0) {
          r.type = changeCase.titleCase(r.types[0]);
        }

        // add provider
        r.dataOrigin = DataOrigin.Google;

        return r;
      });
    });
  }

  enhanceResultsWikipedia(titles): Promise {
    return Promise.map(titles, (title) => {
      return wikipedia.page(title);
    }).then((enhancedResults) => {
      return Promise.map(enhancedResults, (r) => {
        return Promise.props({
          summary: r.summary(),
          image: r.mainImage().catch((e) => {
            console.warn('Error parsing main image', e);
          }),
          name: r.raw.title,
          url: r.raw.fullurl,
          dataOrigin: DataOrigin.Wikipedia
        });
      })
    })
  }

}
