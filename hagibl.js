		var Database = null; //Empty DB

		function str_replace(search, replace, subject) {
			return subject.split(search).join(replace);
		}

		function parse_text( articleText ) {
			/* PARSING TEXT FOR SPECIAL TAGS */
			articleText = str_replace( ':cut:' , '<a class="show-cut">expand...</a><div class="cut">', articleText );
			articleText = str_replace( ':/cut:' , '</div>', articleText );
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
						var articleText = parse_text( article.text ); 
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
				if( array_search( article.tags , tag ) ) {
					tagArticles = tagArticles +
						'<div class="article" id="' + id + '">' +
							'<h1 class="title">' + article.title + '</h1>' +
							'<span class="date">Posted on <a href="javascript:" data-link="' + Crypto.SHA1( article.title ) + '" class="link">' + article.date + '</a>, with tags: ';
						$.each( article.tags , function( id, tag ) {
							tagArticles = tagArticles + ' <a href="javascript:" data-tag="' + tag + '" class="tag">' + tag + '</a>';
						});
						var articleText = parse_text( article.text ); 
						tagArticles = tagArticles + '</span><div class="text">' + articleText + '</div></div>';
				}
			});
			$( '#articles' ).html( tagArticles );
		}

		function getArticleById( articlehash ) {
			/* RETURNING ARTICLE WITH SPECIFIC ID */
			var Article = '';
			$.each( Database.articles , function( id , article ) {
				if( Crypto.SHA1( article.title ) == articlehash ) {
					Article = Article +
						'<div class="article" id="' + id + '">' +
							'<h1 class="title">' + article.title + '</h1>' +
							'<span class="date">Posted on <a href="javascript:" data-link="' + articlehash + '" class="link">' + article.date + '</a>, with tags: ';
						$.each( article.tags , function( id, tag ) {
							Article = Article + ' <a href="javascript:" data-tag="' + tag + '" class="tag">' + tag + '</a>';
						});
						var articleText = parse_text( article.text ); 
						Article = Article + '</span><div class="text">' + articleText + '</div></div>';
					return false;
				}
			});
			$( '#articles' ).html( Article );
		}

		$( document ).ready(function(){

			/* GETTING STARTED */
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

			/* EXPANDING CUTTED TEXT IN ARTICLE */
			$( 'a.show-cut' ).live('click', function(){
				$(this).next( 'div.cut' ).show('medium');
				$(this).remove();
			});

			/* FILTERING ARTICLES BY TAG */
			$( '.date a' ).live('click', function(){
				if( $(this).hasClass('tag') ) {
					window.location.search = 'tag=' + $(this).data('tag');
				} else if( $(this).hasClass('link') ) {
					window.location.search = 'article=' + $(this).data('link');
				}
			});

		});