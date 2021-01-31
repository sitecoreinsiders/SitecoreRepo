jQuery(function() {
	jQuery(document).on("click", ".scCopyUrl", function(e) {
		e.preventDefault();
		
		var $this = jQuery(this);
		var copyText = $this.prev().text();
		var textArea = document.createElement("textarea");
		textArea.value = copyText;
		document.body.appendChild(textArea);
		textArea.select();
		document.execCommand("Copy");
		textArea.remove();
		
		$this.text("Copied!").css("background-color", "lightgreen");
		setTimeout(function(){ $this.text("Copy URL").css("background-color", ""); }, 800);
	});
});
