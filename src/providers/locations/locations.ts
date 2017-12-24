import { Injectable } from '@angular/core';

declare var google;

@Injectable()
export class LocationsProvider {

  // true when the Google library is ready to use
  public isLoaded: boolean = false;
  // a promise that resolves when the Google library is ready to use
  public loaded: Promise<boolean>;

  private static readonly GOOGLE_API_KEY = 'AIzaSyByfEqdVsLZ4mxFqZnv1cpgp7rRGihwe8E';
  private isInjected: boolean = false;
  private loadedResolver;

  constructor() {
    console.log('Hello LocationsProvider Provider');
    // this.load();
  }

  // injects the Google JS libraries into the page with a <script> tag
  load() {
    if (this.isInjected) {
      console.warn('Already injected Google libraries.');
      return;
    }

    let url: string = `https://maps.googleapis.com/maps/api/js?key=${LocationsProvider.GOOGLE_API_KEY}&libraries=places&callback=googleLibrariesLoaded`;
    let script = document.createElement('script');
    script.src = url;

    // global-scope callback executed by the loaded Google JS file
    window['googleLibrariesLoaded'] = () => {
      this.isLoaded = true;
      this.loadedResolver(true);
      console.log('Google libraries loaded.');
    }

    console.log('Attempting to inject Google libraries with URL:', url);
    this.loaded = new Promise((resolve) => {
      // save the promise resolver to be resolved by the callback
      this.loadedResolver = resolve;
      document.body.appendChild(script);
      this.isInjected = true;
      console.log('Google libraries injected.');
    });
  }

  searchNearby(origin: google.maps.LatLng, radius: number) {

  }

}
