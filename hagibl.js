/* GLOBAL VARIABLES */

var Database = null; //Empty DB
var BlogTitle = null;
var pageNumber = 1;

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
	if( hash[1] == '' || window.location.hash == '' || hash[1] == 'page' ) { // if no hash - main page
		$( 'title' ).text( BlogTitle );
		var pageNumber = hash[2];
		if( !parseInt( pageNumber ) || pageNumber < 1 ) {
			window.location.hash = '#!/';
			pageNumber = 1;
		}
		var postsCount = Database.articles.length;
		$.each( Database.articles , function( id , article ) {
			if( id >= ( Database.articlesonpage * pageNumber - Database.articlesonpage ) && id < ( Database.articlesonpage * pageNumber ) ) {
				var postlink = Crypto.SHA1( article.title );
				Articles = Articles +
					'<div class="article" id="' + id + '">' +
					'<h1 class="title">' + article.title + '</h1>' +
					'<span class="date">Posted on <a href="#!/post/' + postlink + '" data-content="' + postlink + '" class="post">' + article.date + '</a>, with tags: ';
							$.each( article.tags , function( id, tag ) {
								Articles = Articles + ' <a href="#!/tag/' + tag + '" data-content="' + tag + '" class="tag">' + tag + '</a>';
							});
				Articles = Articles + '</span><div class="text">' + parse_text( article.text, false ) + '</div></div>';
			}
		});
	} else if( hash[1] == 'tag' ) { // if 'tag' in hash - building tag based posts search
		$( 'title' ).text( BlogTitle );
		$.each( Database.articles , function( id , article ) {
			if( array_search( article.tags , decodeURI( hash[2] ) ) ) {
				var postlink = Crypto.SHA1( article.title );
				Articles = Articles +
					'<div class="article" id="' + id + '">' +
						'<h1 class="title">' + article.title + '</h1>' +
						'<span class="date">Posted on <a href="#!/post/' + postlink + '" data-content="' + postlink + '" class="post">' + article.date + '</a>, with tags: ';
					$.each( article.tags , function( id, tag ) {
						Articles = Articles + ' <a href="#!/tag/' + tag + '" data-content="' + tag + '" class="tag">' + tag + '</a>';
					});
				Articles = Articles + '</span><div class="text">' + parse_text( article.text, false ) + '</div></div>';
			}
		});
	} else if( hash[1] == 'post' ) { // if 'post' in hash - building id based post page
		$.each( Database.articles , function( id , article ) {
			if( Crypto.SHA1( article.title ) == hash[2] ) {
				BlogTitle = $( 'title' ).text();
				$( 'title' ).text( $( 'title' ).text() + ' / ' + article.title );
				Articles = Articles +
					'<div class="article" id="' + id + '">' +
						'<h1 class="title">' + article.title + '</h1>' +
						'<span class="date">Posted on <a href="#!/post/' + hash[2] + '" data-content="' + hash[2] + '" class="post">' + article.date + '</a>, with tags: ';
					$.each( article.tags , function( id, tag ) {
						Articles = Articles + ' <a href="#!/tag/' + tag + '" data-content="' + tag + '" class="tag">' + tag + '</a>';
					});
					Articles = Articles + '</span><div class="text">' + parse_text( article.text, true ) + '</div></div>';
				return false;
			}
		});
	}
	if( Articles == '' ) {
		Articles = '<div class="article"><h1 class="title">Error</h1><div class="text">Something went wrong. Either no posts found or database error. Try to search on <a href="#!/" class="mainpage">front page</a>.</div></div>';
	} else {
		$( '#pagination p' ).css({ visibility: 'hidden' });
		if( postsCount && postsCount > Database.articlesonpage ) {
			if( pageNumber > 1 ) {
				$( '#pagination p.next' ).css({ visibility: 'visible' });
			}
			if( pageNumber < Math.ceil( postsCount / Database.articlesonpage ) ) {
				$( '#pagination p.prev' ).css({ visibility: 'visible' });
			}
		}
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
		window.location.hash = '#!/'+ $(this).attr('class') +'/' + $(this).data('content');
		getArticles();
	});

	$( '#title a, .mainpage' ).live('click', function(){
		window.location.hash = '#!/';
		getArticles();
	});

	$(' #pagination .next').click(function(){
		window.location.hash = '#!/page/' + ( pageNumber - 1 );
		getArticles();
	});

	$(' #pagination .prev').click(function(){
		window.location.hash = '#!/page/' + ( pageNumber + 1 );
		getArticles();
	});

});