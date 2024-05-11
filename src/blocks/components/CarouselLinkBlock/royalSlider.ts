interface RoyalSliderJQuery extends JQuery {
  royalSlider: (config: Record<string, unknown>) => JQuery;
}

const setData = (instance: JQuery, key: string, data: Record<string, string>) => {
  instance.data(key, data);
};
const getData = (instance: JQuery, key: string) => instance.data(key);
const amendData = (instance: JQuery, selector: string, storeKey: string, key: string, value: string) => {
  const button = instance.find(selector);
  setData(button, storeKey, { ...getData(button, storeKey), [key]: value });
};
const setFullscreenToggleAttributes = (button: JQuery, isFullscreen: boolean) => {
  const data = getData(button, isFullscreen ? 'closeFullScreen' : 'openFullScreen');
  const entries = data && Object.entries(data);
  if (entries) {
    for (const [key, value] of entries) {
      button.attr(key, value);
    }
  }
};

export const setFlipperAttribute = (instance: JQuery, key: string, value: string): void => {
  instance.find('.rsArrow').each((_, e) => {
    window.$(e).attr(key, value);
  });
};

export const setFullScreenAttribute = (instance: JQuery, key: string, value: string): void => {
  amendData(instance, '.rsFullscreenBtn', 'openFullScreen', key, value);
  setFullscreenToggleAttributes(instance.find('.rsFullscreenBtn'), false);
};
export const setCloseFullScreenAttribute = (instance: JQuery, key: string, value: string): void => {
  amendData(instance, '.rsFullscreenBtn', 'closeFullScreen', key, value);
};

export const initializeRoyalSlider = (element: Element, rsActionBar: Element): JQuery => {
  const rs_config = {
    fullscreen: {
      enabled: true,
      nativeFS: false,
    },

    controlNavigation: 'none',
    autoScaleSlider: true,
    autoScaleSliderWidth: 640,
    autoScaleSliderHeight: 360,
    imageScalePadding: 0,
    loop: false,
    imageScaleMode: 'fit',
    navigateByClick: true,
    numImagesToPreload: 0,
    arrowsNav: true,
    arrowsNavAutoHide: true,
    arrowsNavHideOnTouch: true,
    keyboardNavEnabled: true,
    fadeinLoadedSlide: true,
    globalCaption: true,
    globalCaptionInside: false,
    transitionType: 'fade',
    transitionSpeed: 200,

    thumbs: {
      fitInViewport: false,
      appendSpan: true,
      firstMargin: true,
      paddingBottom: 0,
    },
  };

  const imageSliderJQ = (window.$(element) as RoyalSliderJQuery).royalSlider(rs_config);

  // slider initialized, now append slide-count
  const sliderInstance = imageSliderJQ.data('royalSlider');
  if (sliderInstance) {
    const sliderOverflow = imageSliderJQ.find('.rsOverflow');
    window.$(rsActionBar.innerHTML).appendTo(sliderOverflow);

    const slideCountEl = window.$('.rsSlideCount', sliderOverflow);

    // Move the hidden share overlay to the current slideshow
    const blockContent = window.$(element).parents('.slideshow:first');
    const imageOnlyBtn = blockContent.find('.rsImageOnlyBtn');
    const closeBtn = blockContent.find('.rsCloseShareOverlayBtn');
    const fullScreenBtn = blockContent.find('.rsFullscreenBtn');

    fullScreenBtn.on('click', function () {
      blockContent.toggleClass('slideshowIsFullscreen');
      setFullscreenToggleAttributes(fullScreenBtn, blockContent.hasClass('slideshowIsFullscreen'));
    });

    window.$(document).keyup((e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        blockContent.removeClass('slideshowIsFullscreen');
      }
    });

    imageOnlyBtn.on('click', function (e: Event) {
      e.preventDefault();
      imageOnlyBtn.toggleClass('open').toggleClass('closed');

      imageSliderJQ.toggleClass('rsImageOnly');

      setTimeout(function () {
        sliderInstance.updateSliderSize(true);
      }, 10);
    });

    closeBtn.on('click', function (e: Event) {
      e.preventDefault();
      blockContent.removeClass('overlayActive');
    });

    function updCount() {
      slideCountEl.html(sliderInstance.currSlideId + 1 + ' / ' + sliderInstance.numSlides);
    }
    sliderInstance.ev.on('rsAfterSlideChange', updCount);
    updCount();
  }
  return imageSliderJQ;
};
