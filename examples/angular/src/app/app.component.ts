import {Component} from '@angular/core';
import * as woleet from '@woleet/woleet-weblibs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  title = 'woleet-weblibs';
  version = 'undefined';

  private __hash = this._hash('');

  private __hashList = [];

  private __hasher: woleet.file.Hasher = null;

  private __current: any = null;

  get hash() {
    return this.__hash;
  }

  get hashList() {
    return this.__hashList;
  }

  constructor() {
    this.version = woleet.version;
    const self = this;
    const hasher = this.__hasher = new woleet.file.Hasher;

    hasher.on('start', function (message) {
      self.__current = {
        progress: 0,
        name: message.file.name
      };
      self.__hashList.push(self.__current);
    });
    hasher.on('progress', function (message) {
      console.log(message);
      self.__current.progress = (message.progress * 100).toFixed(2)
    });
    hasher.on('error', function (error) {
      console.error(error);
    });
    hasher.on('cancel', function (message) {
      self.__current.hash = 'cancelled';
    });
    hasher.on('skip', function (message) {
      self.__current.hash = 'skipped';
    });
    // On success, display computed hash
    hasher.on('result', function (message) {
      self.__current.hash = message.result;
    });
  }

  private _hash(s: string): string {
    return woleet.crypto.sha256().update(s).digest('hex');
  }

  hashString(event) {
    this.__hash = this._hash(event.target.value);
    console.log(woleet, woleet.version);
  }

  hashFiles(event) {
    const files = event.srcElement.files;
    console.log(files);

    let hasher = this.__hasher;

    // This transformation is for testing purpose only
    // we could pass directly "files" as it is a FileList object
    let arr = [];
    for (let i = 0; i < files.length; i++) arr.push(files[i]);

    try {
      hasher.start(arr);
    } catch (err) {
      console.warn(err);
    }

  }

}
