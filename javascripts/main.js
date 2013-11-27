$(window).load(function(){
    var webappCache = window.applicationCache;

    function loaded(){
        var h2Title = document.querySelector("app-status");
        var connectionStatus = ((navigator.onLine) ? 'online' : 'offline');
        
        h2Title.textContent = h2Title.textContent + " - currently: " + connectionStatus;
        document.title = document.title.replace(" | "," - currently: " + connectionStatus + " | ");
    }
    
    function updateCache(){
        webappCache.swapCache();
        console.log("Cache has been updated due to a change found in the manifest");
    }
    
    function errorCache(){
        console.log("You're either offline or something has gone horribly wrong.");
    }

    window.addEventListener("load", loaded, false);
    webappCache.addEventListener("updateready", updateCache, false);
    webappCache.addEventListener("error", errorCache, false);

    function Field (id, formId, value, title, disabled){
        this.id 		= id;
        this.formId 	= formId;
        this.value 		= value;
        this.title 		= title;
        this.disabled 	= disabled;
        this.rendered 	= false;
        
        this.render = function(){
            if (!this.rendered) {
                var html = '<div class="form-group"><label for="';
                html += this.id.replace('#','');
                html += '">';
                html += this.title;
                html += '</label>';
                html += '<input type="number" min="0" class="form-control" id="';
                html += this.id.replace('#','');
                
                if(this.value !== null){
                    html += '" value="';
                    html += this.value;
                }
                
                if(this.disabled){
                    html += '" disabled="';
                    html += this.disabled;
                }
                
                html += '"/></div>';
                $('form#' + this.formId).append(html);
                this.rendered = true;
            }
        };
    }
    
    function Result(id, value, color, title, footer){
    	this.id 		= id;
        this.value 		= value;
        this.color 		= color;
        this.title 		= title;
        this.footer 	= footer;
        this.rendered 	= false;
        
        this.render = function(){
        	if(this.rendered){
        		$('#' + this.id + '-container').html('');
        	}
        	var title_html		= '<div id="%s-title" class="header %s">%s</div>';
        	var content_html	= '<div id="%s-value" class="content %s">%s</div>';
        	var footer_html		= '<div id="%s-footer" class="footer %s">%s</div>';
        	
        	var html = 	sprintf(title_html, this.id, this.color, this.title);
        		html += sprintf(content_html, this.id, this.color, this.value);
        		html += sprintf(footer_html, this.id, this.color, this.footer);
        	
        	$('#' + this.id + '-container').html(html);
			this.rendered = true;
        };
    }
    
    var fields = {
        monthlyCustomers: new Field('#monthlyCustomers','form1', 150, 'Jobs/Customers per month', false),
        customerSpent: new Field('#customerSpent','form1', 500.00, 'Average cost per job/customer £', false),
        nectarSpend: new Field('#nectarSpend','form1', 30, 'Spend on Nectar Cards %', false),
        jobValue: new Field('#jobValue','form2', 100.00, 'Job Value £', false),
    };
    
    var results = {};
    
    $('#calc-button').click(function(e){
    	e.preventDefault();
    	
    	var customers	= parseInt($(fields.monthlyCustomers.id).val(), 0);
    	var spent		= parseFloat($(fields.customerSpent.id).val());
    	var percent     = parseInt($(fields.nectarSpend.id).val(), 0) / 100;
    	var fee			= 20.0;
    	var points	= 2;
    	
    	var total         = customers * spent;
        var pointsIssued  = total * points * percent;
        var pointsCost    = pointsIssued * 0.012;
        var totalMonth    = pointsCost + fee;
        var roi           = totalMonth / spent;
    	
    	results = {
			monthlyFee			: new Result('monthly-fee', formatPrice(fee), 'hibu-green', 'Nectar Local Fee', 'per month'),
			customerSpentMonth	: new Result('customer-spent-month', formatPrice(total), 'hibu-blue', 'Consumers Spend', 'per month'),
			points   			: new Result('points', Math.round(pointsIssued), 'hibu-green', 'Points Issued', points + ' points per £ spent'),
			pointsCost   		: new Result('points-cost', formatPrice(pointsCost), 'hibu-red', 'Cost of Points', 'per month'),
			totalMonth   		: new Result('total-month', formatPrice(totalMonth), 'hibu-blue', 'Total Cost', 'per month'),
			roi   				: new Result('roi', Math.round(roi), 'hibu-red', 'ROI', 'Customers/Jobs')
    	};
    	
    	$.each(results, function(i, el){
            this.render();
    	});
    	
    	$('#empty-results').hide();
    	$('#simple-results').hide();
    	$('#results').show();
    	
    	return false;
    });
    
    $('#quick-calc-button').click(function(e){
    	var jobValue = parseFloat($(fields.jobValue.id).val());
    	var points = jobValue * 2;
        var cost = points * 0.012;
        
        results = {
    		points	: new Result('points-issued', Math.round(points), 'hibu-green', 'Points Issued', 'per month'),
    		cost	: new Result('cost-points', formatPrice(cost), 'hibu-blue', 'Cost of Points', 'per month'),
    	};
    	
    	$.each(results, function(i, el){
            this.render();
    	});
    	
    	$('#empty-results').hide();
    	$('#results').hide();
    	$('#simple-results').show();
        
    });
    
    var quickCalculator = function(f){
        var jobValue = parseFloat($(f.jobValue.id).val());
        var points = jobValue * 2;
        var cost = points * 0.012;
        $(f.quickPointsIssued.id).val(points);
        $(f.quickPointsCost.id).val(cost);
    };
    
    $.each(fields, function(i, el){
        var that = this;
        this.render();
//        $(this.id).on('input', function(event){
//            that.value = $(this).val();
//            refresh(fields);
//        });
    });
    
});

function formatPrice(price){
    if (typeof price === 'string' || price instanceof String){
//        price = parseFloat(price.replace(',','.'));
        price = parseFloat(price);
    }
    
    if(price >= 1000){
        return price.toLocaleString('en', {
            style:'currency',
            currency: 'gbp',
            maximumFractionDigits: 0
        });
    }else{
        return price.toLocaleString('en', {
            style:'currency',
            currency: 'gbp',
            maximumFractionDigits: 2,
            minimumFractionDigits: 2
        });
    }
}

