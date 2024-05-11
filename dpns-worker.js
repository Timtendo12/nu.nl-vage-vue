/* global clients */
self.addEventListener('notificationclick', function (event) {
  event.notification.close();

  var options = event.notification;
  const request_id = options.data['PNS-Request-Id'];

  var type = options.data.type;
  var article_id = options.data.article_id;
  var url_components = [self.location.origin];
  if (type === 'article' && article_id !== 'undefined') {
    url_components.push('artikel');
    url_components.push(article_id);
    url_components.push(
      'redirect.html?push_request_id=' +
        request_id +
        '&source=notification-open&utm_medium=push&utm_source=browser_push&utm_campaign=stdc_nu',
    );
  }
  var url = url_components.join('/');

  var openPagePromise = clients
    .matchAll({
      type: 'window',
      includeUncontrolled: true, // Include windows which are not controlled by this worker
    })
    .then(function (windowClients) {
      // Checking if there is window/tab with current url already open
      // and focus this one otherwise open a new window
      for (var i = 0; i < windowClients.length; i++) {
        var client = windowClients[i];
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    });

  event.waitUntil(openPagePromise);
});
