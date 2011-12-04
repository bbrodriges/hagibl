/* GLOBAL VARIABLES */

var Database = null; //Empty DB

/* ------------------------------------------------------- */

/* ADDITIONAL FUNCTIONS */

function str_replace(search, replace, subject) { /* REPLACE OCCURANCES IN STRING */
	return subject.split(search).join(replace);
}

function parse_text( articleText, exclude_cut ) { /* PARSING TEXT FOR SPECIAL TAGS */
	var opencut = '<a class="show-cut">expand...</a><div class="cut">';
	var closecut = '</div>';
	if( exclude_cut ) {
		opencut = '<div class="uncut">';
	}
	articleText = str_replace( ':cut:' , opencut, articleText );
	articleText = str_replace( ':/cut:' , closecut, articleText );
	return articleText;
}

function array_search( haystack, needle ) { /* FIND POST IN DATABASE */
	for( var key in haystack ){
		if( haystack[key] === needle ){
			return key;
		}
	}
			return false;
}

function getArticles() { /* RETURN PAGE BY GIVEN TYPE AND ID */
	var hash = window.location.hash.split('/');
	var Articles = '';
	if( hash[1] == '' || window.location.hash == '' ) { // if no hash - main page
		window.location.hash = '#!/';
		$.each( Database.articles , function( id , article ) {
			if( id < Database.articlesonpage ) {
				Articles = Articles +
					'<div class="article" id="' + id + '">' +
					'<h1 class="title">' + article.title + '</h1>' +
					'<span class="date">Posted on <a href="#!/article/' + Crypto.SHA1( article.title ) + '" data-link="' + Crypto.SHA1( article.title ) + '" class="link">' + article.date + '</a>, with tags: ';
							$.each( article.tags , function( id, tag ) {
								Articles = Articles + ' <a href="#!/tag/' + tag + '" data-tag="' + tag + '" class="tag">' + tag + '</a>';
							});
				Articles = Articles + '</span><div class="text">' + parse_text( article.text, false ) + '</div></div>';
			}
		});
	} else if( hash[1] == 'tag' ) { // if 'tag' in hash - building tag based posts search
			$.each( Database.articles , function( id , article ) {
				if( array_search( article.tags , decodeURI( hash[2] ) ) ) {
					Articles = Articles +
						'<div class="article" id="' + id + '">' +
							'<h1 class="title">' + article.title + '</h1>' +
							'<span class="date">Posted on <a href="javascript:" data-link="' + Crypto.SHA1( article.title ) + '" class="link">' + article.date + '</a>, with tags: ';
						$.each( article.tags , function( id, tag ) {
							Articles = Articles + ' <a href="javascript:" data-tag="' + tag + '" class="tag">' + tag + '</a>';
						});
					Articles = Articles + '</span><div class="text">' + parse_text( article.text, false ) + '</div></div>';
				}
			});
	} else if( hash[1] == 'article' ) {
		$.each( Database.articles , function( id , article ) {
			if( Crypto.SHA1( article.title ) == hash[2] ) {
				$( 'title' ).text( $( 'title' ).text() + ' / ' + article.title );
				Articles = Articles +
					'<div class="article" id="' + id + '">' +
						'<h1 class="title">' + article.title + '</h1>' +
						'<span class="date">Posted on <a href="javascript:" data-link="' + hash[2] + '" class="link">' + article.date + '</a>, with tags: ';
					$.each( article.tags , function( id, tag ) {
						Articles = Articles + ' <a href="javascript:" data-tag="' + tag + '" class="tag">' + tag + '</a>';
					});
					Articles = Articles + '</span><div class="text">' + parse_text( article.text, true ) + '</div></div>';
				return false;
			}
		});
	}

	if( Articles == '' ) {
			Articles = '<div class="article"><h1 class="title">Error</h1><div class="text">Something went wrong. Either no posts found or database error. Try to search on <a href="/">front page</a>.</div></div>';
	}

	$( '#articles' ).html( Articles );
}

/* ------------------------------------------------------- */

$.ajax({ /* READING DATABASE */
	url: 'db.json',
	dataType: 'json',
	async: false,
	success: function( db ) {
		Database = db;
	}
});

$( document ).ready(function() { /* WAITING PAGE TO BE LOADED TO DISPLAY ARTICLES */

	if( Database != null ) { /* Loading articles */
		getArticles();
	} else {
		createErrorPage( 'Database error' );
	}

	$("#stream").lifestream({ /* Loading lifestream */
		list:[
			{
				service: "github",
				user: "bbrodriges"
			}
		]
	});

	$( 'a.show-cut' ).live('click', function(){ /* Show cutted text on click */
		$( 'div.cut' ).hide('medium');
		$( 'a.show-cut' ).show('medium');
		$(this).next( 'div.cut' ).show('medium');
		$(this).hide();
	});

	$( '.date a' ).live('click', function(){
		if( $(this).hasClass('tag') ) {
			window.location.hash = '#!/tag/' + $(this).data('tag');
		} else if( $(this).hasClass('link') ) {
			window.location.hash = '#!/article/' + $(this).data('link');
		}
		getArticles();
	});

	$( '#title a' ).live('click', function(){
		window.location.hash = '#!/';
		getArticles();
	});

});