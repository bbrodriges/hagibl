		var Database = null; //Empty DB
		
		/* READING DB STARTED */
		function readDB() { 
			$.getJSON( 'db.json' , function( db ) {
				Database = db;
				if( window.location.search == '' ) {
					getFirstPage();
				} else {
					var hash = window.location.search.split('=');
					if( hash[0] == '?tag' ) {
						getArticlesByTag( hash[1] );
					} else if( hash[0] == '?article' ){
						getArticleById( hash[1] );
					}
				}
			});
			if( Database != null ) {
				return true;
			}
			return false;
		}

		function str_replace(search, replace, subject) {
			return subject.split(search).join(replace);
		}

		function parse_text( articleText, exclude_cut ) {
			/* PARSING TEXT FOR SPECIAL TAGS */
			var opencut = '<a class="show-cut">expand...</a><div class="cut">';
			var closecut = '</div>';
			if( exclude_cut ) {
				opencut = '<div class="uncut">';
			}
			articleText = str_replace( ':cut:' , opencut, articleText );
			articleText = str_replace( ':/cut:' , closecut, articleText );
			return articleText;
		}

		function array_search( haystack, needle ) {
			for( var key in haystack ){
				if( haystack[key] === needle ){
					return key;
				}
			}
			return false;
		}
		
		function createErrorPage( message ) {
			$( '#articles' ).html( message );
		}

		function getFirstPage() {
			/* DISPLAYING FIRST PAGE */
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
			/* RETURNING ALL ARTICLES WITH SPECIFIC TAG */
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
			/* RETURNING ARTICLE WITH SPECIFIC ID */
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

		/* PAGE LOADED, DOING MAGIC, CASTING SPELLS */
		$( document ).ready(function(){

			if( !readDB() ) {
				message = '<div class="article"><h1 class="title">Database broken</h1><div class="text">Something wrong with your JSON database. You can validate database at <a href="http://jsonlint.com">JSONlint</a>.</div></div>';
				createErrorPage( message );
			}

			/* EXPANDING CUTTED TEXT IN ARTICLE */
			$( 'a.show-cut' ).live('click', function(){
				$( 'div.cut' ).hide('medium');
				$( 'a.show-cut' ).show('medium');
				$(this).next( 'div.cut' ).show('medium');
				$(this).hide();
			});

			/* FILTERING ARTICLES BY TAG */
			$( '.date a' ).live('click', function(){
				if( $(this).hasClass('tag') ) {
					window.location.search = 'tag=' + $(this).data('tag');
				} else if( $(this).hasClass('link') ) {
					window.location.search = 'article=' + $(this).data('link');
				}
			});
			
			/* MANAGING SOCIAL LIVESTREAM */
			$("#stream").lifestream({
				list:[
				  {
					service: "github",
					user: "bbrodriges"
				  }
				]
				/* More info about lifestream and available services at https://github.com/christianv/jquery-lifestream/ */
			});
		});