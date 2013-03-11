$(function() {
    var termListUrls = ["facebook.com", "apple.de", "google.de", "www.golem.de", "golem.de"];
    var termListNames = ["Peter", "Karl", "Patrick", "Leonardo", "Mark"];
	
    $('.url-list').text(termListUrls.join(', '));
    $('.name-list').text(termListNames.join(', '));
	
//    $('[name=autocomplete_urls]').inlineComplete({
//        submitOnReturn: true,
//        terms: termListUrls
//    });
//
//    $('[name=autocomplete_names]').inlineComplete({
//        terms: termListNames
//    });
//
//    // TODO Simulate very long request in combination with chaining methods.
//    $('[name=autocomplete_cities]').inlineComplete({
//        terms: 'cities.json'
//    });
//
//    $('[name=autocomplete_data_attr_list]').inlineComplete();
//
//    $('[name=autocomplete_data_attr_url]').inlineComplete();

    $('#dummy').inlineComplete();

});