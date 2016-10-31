import $ from 'jquery';
import _ from 'underscore';

function getOpenGraphProtocol() { // eslint-disable-line no-unused-vars
  return new Promise((resolve) => {
    resolve(_.pick({
      title: $('meta[property="og:title"]').attr('content'),
      type: $('meta[property="og:type"]').attr('content'),
      image: $('meta[property="og:image"]').attr('content'),
      url: $('meta[property="og:url"]').attr('content'),
      site_name: $('meta[property="og:site_name"]').attr('content'),
      audio: $('meta[property="og:audio"]').attr('content'),
      video: $('meta[property="og:video"]').attr('content'),
      description: $('meta[property="og:description"]').attr('content'),
      determiner: $('meta[property="og:determiner"]').attr('content'),
      locale: $('meta[property="og:locale"]').attr('content'),
    }, _.identity));
  });
}

function getMetaTags() { // eslint-disable-line no-unused-vars
  return new Promise((resolve) => {
    resolve($('head meta').map((index, meta) => {
      if (meta.name && meta.content) {
        return {
          name: meta.name,
          content: meta.content,
        };
      }
      return {};
    }).toArray());
  });
}

window.getOpenGraphProtocol = getOpenGraphProtocol;
window.getMetaTags = getMetaTags;
