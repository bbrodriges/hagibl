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

function createErrorPage( message ) { /* CREATE ERROR PAGE */
	$( '#articles' ).html( message );
}

function getArticles( page, id ) { /* RETURN PAGE BY GIVEN TYPE AND ID */
	var hash = window.location.hash.split('/');
	var blogArticles = '';
	if( hash[1] == '' || window.location.hash == '' ) { // if no hash - main page
		window.location.hash = '#!/';
		$.each( Database.articles , function( id , article ) {
			if( id < Database.articlesonpage ) {
				blogArticles = blogArticles +
					'<div class="article" id="' + id + '">' +
					'<h1 class="title">' + article.title + '</h1>' +
					'<span class="date">Posted on <a href="javascript:" data-link="' + Crypto.SHA1( article.title ) + '" class="link">' + article.date + '</a>, with tags: ';
							$.each( article.tags , function( id, tag ) {
								blogArticles = blogArticles + ' <a href="javascript:" data-tag="' + tag + '" class="tag">' + tag + '</a>';
							});
				var articleText = parse_text( article.text, false ); 
				blogArticles = blogArticles + '</span><div class="text">' + articleText + '</div></div>';
			}
		});
	}
	$( '#articles' ).html( blogArticles );
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
	if( Database != null ) {
		getArticles();
	} else {
		createErrorPage( 'Database error' );
	}
});

		/*function getArticles( page ) {
				var blogArticles = '';
				$.each( Database.articles , function( id , article ) {
					if( id < Database.articlesonpage ) {
						blogArticles = blogArticles +
							'<div class="article" id="' + id + '">' +
								'<h1 class="title">' + article.title + '</h1>' +
								'<span class="date">Posted on <a href="javascript:" data-link="' + Crypto.SHA1( article.title ) + '" class="link">' + article.date + '</a>, with tags: ';
						$.each( article.tags , function( id, tag ) {
							blogArticles = blogArticles + ' <a href="javascript:" data-tag="' + tag + '" class="tag">' + tag + '</a>';
						});
						var articleText = parse_text( article.text, false ); 
						blogArticles = blogArticles + '</span><div class="text">' + articleText + '</div></div>';
					} else {
						return false;
					}
				});
				$( '#articles' ).html( blogArticles );
		}

		function getArticlesByTag( tag ) {
			var tagArticles = '';
			$.each( Database.articles , function( id , article ) {
				if( array_search( article.tags , decodeURI( tag ) ) ) {
					tagArticles = tagArticles +
						'<div class="article" id="' + id + '">' +
							'<h1 class="title">' + article.title + '</h1>' +
							'<span class="date">Posted on <a href="javascript:" data-link="' + Crypto.SHA1( article.title ) + '" class="link">' + article.date + '</a>, with tags: ';
						$.each( article.tags , function( id, tag ) {
							tagArticles = tagArticles + ' <a href="javascript:" data-tag="' + tag + '" class="tag">' + tag + '</a>';
						});
						var articleText = parse_text( article.text, false ); 
						tagArticles = tagArticles + '</span><div class="text">' + articleText + '</div></div>';
				}
			});
			if( tagArticles == '' ) {
				message = '<div class="article"><h1 class="title">No posts with this tag found</h1><div class="text">You can try to search on <a href="/">front page</a>.</div></div>';
				createErrorPage( message );
			} else {
				$( '#articles' ).html( tagArticles );
			}
		}

		function getArticleById( articlehash ) {
			var Article = '';
			$.each( Database.articles , function( id , article ) {
				if( Crypto.SHA1( article.title ) == articlehash ) {
					$( 'title' ).text( $( 'title' ).text() + ' / ' + article.title );
					Article = Article +
						'<div class="article" id="' + id + '">' +
							'<h1 class="title">' + article.title + '</h1>' +
							'<span class="date">Posted on <a href="javascript:" data-link="' + articlehash + '" class="link">' + article.date + '</a>, with tags: ';
						$.each( article.tags , function( id, tag ) {
							Article = Article + ' <a href="javascript:" data-tag="' + tag + '" class="tag">' + tag + '</a>';
						});
						var articleText = parse_text( article.text, true ); 
						Article = Article + '</span><div class="text">' + articleText + '</div></div>';
					return false;
				}
			});
			if( Article == '' ) {
				message = '<div class="article"><h1 class="title">Post has not been fount</h1><div class="text">You can try to search on <a href="/">front page</a>.</div></div>';
				createErrorPage( message );
			} else {
				$( '#articles' ).html( Article );
			}
		}

		$( document ).ready(function() {

			if( Database == null ) {
				message = '<div class="article"><h1 class="title">Database broken</h1><div class="text">Something wrong with your JSON database. You can validate database at <a href="http://jsonlint.com">JSONlint</a>.</div></div>';
				createErrorPage( message );
			}

			$( 'a.show-cut' ).live('click', function(){
				$( 'div.cut' ).hide('medium');
				$( 'a.show-cut' ).show('medium');
				$(this).next( 'div.cut' ).show('medium');
				$(this).hide();
			});

			$( '.date a' ).live('click', function(){
				if( $(this).hasClass('tag') ) {
					window.location.search = 'tag=' + $(this).data('tag');
				} else if( $(this).hasClass('link') ) {
					window.location.search = 'article=' + $(this).data('link');
				}
			});
			
			$("#stream").lifestream({
				list:[
				  {
					service: "github",
					user: "bbrodriges"
				  }
				]
			});
		});*/