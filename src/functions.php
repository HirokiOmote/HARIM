<?php
add_action( 'wp_enqueue_scripts', 'supro_child_enqueue_scripts', 20 );

function supro_child_enqueue_scripts() {
	wp_enqueue_style( 'supro-child-style', get_stylesheet_uri());
	wp_enqueue_style( 'all', get_stylesheet_directory_uri() . '/css/all.css', null, false);

	if ( is_rtl() ) {
		wp_enqueue_style( 'supro-rtl', get_template_directory_uri() . '/rtl.css', array(), '20180727' );
	}
}
