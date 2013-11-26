$(window).load(function(){
    var webappCache = window.applicationCache;

    function loaded(){
        var h2Title = document.querySelector("app-status");
        var connectionStatus = ((navigator.onLine) ? 'online' : 'offline');
        
        h2Title.textContent = h2Title.textContent + " - currently: " + connectionStatus;
        document.title = document.title.replace(" | "," - currently: " + connectionStatus + " | ");
        
        switch(webappCache.status){
            case 0:
                console.log("Cache status: Uncached");
                break;
            case 1:
                console.log("Cache status: Idle");
                break;
            case 2:
                console.log("Cache status: Checking");
                break;
            case 3:
                console.log("Cache status: Downloading");
                break;
            case 4:
                console.log("Cache status: Updateready");
                break;
            case 5:
                console.log("Cache status: Obsolete");
                break;
        }
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
        this.id = id;
        this.formId = formId;
        this.value = value;
        this.title = title;
        this.disabled = disabled;
        this.rendered = false;
        
        this.render = function(){
            if (!this.rendered) {
                var html = '<div class="form-group"><label for="';
                html += this.id.replace('#','');
                html += '" class="col-sm-8 control-label">';
                html += this.title;
                html += '</label><div class="col-sm-4">';
                html += '<input type="text" class="form-control" id="';
                html += this.id.replace('#','');
                
                if(this.value !== null){
                    html += '" value="';
                    html += this.value;
                }
                
                if(this.disabled){
                    html += '" disabled="';
                    html += this.disabled;
                }
                
                html += '"/></div></div>';
                $('form#' + this.formId).append(html);
                this.rendered = true;
                //TODO: Bind the change to the value of the field.
            }
        };
    }
    
    var fields = {
        monthlyFee: new Field('#monthlyFee','form1', 20.00, 'Monthly Fee £', true),
        monthlyCustomers: new Field('#monthlyCustomers','form1', 150, 'Jobs/Customers per month', false),
        customerSpent: new Field('#customerSpent','form1', 500.00, 'Average cost per job/customer £', false),
        customerSpentMonth: new Field('#customerSpentMonth','form1', null, 'Consumer spend per month £', true),
        nectarSpend: new Field('#nectarSpend','form1', 30, 'Spend on Nectar Cards %', false),
        points: new Field('#points','form1', 2, 'Points per £ Spent', true),
        
        pointsIssued: new Field('#pointsIssued','form2', null, 'Points Issued', true),
        pointsCost: new Field('#pointsCost','form2', null, 'Cost of Points £', true),
        totalMonthly: new Field('#totalMonthly','form2', null, 'Total Monthly cost £', true),
        roi: new Field('#roi','form2', null, 'Customers/Jobs to cover cost', true),
        
        jobValue: new Field('#jobValue','form3', 100.00, 'Job Value £', false),
        quickPointsIssued: new Field('#quickPointsIssued','form3', null, 'Points Issued', true),
        quickPointsCost: new Field('#quickPointsCost','form3', null, 'Cost of Points £', true)
    };
    
    var calculateCustomerSpentMonth = function(f){
        var customers     = parseInt($(f.monthlyCustomers.id).val(), 0);
        var spent         = parseFloat($(f.customerSpent.id).val());
        $(f.customerSpentMonth.id).val(customers * spent);
    };
    
    var calculateROI = function(f){
        var customers     = parseInt($(f.monthlyCustomers.id).val(), 0);
        var spent         = parseFloat($(f.customerSpent.id).val());
        var total         = customers * spent;
        
        var percent       = parseInt($(f.nectarSpend.id).val(), 0) / 100;
        var points        = f.points.value;
        var pointsIssued  = total * points * percent;
        var pointsCost    = pointsIssued * 0.012;
        var totalMonth    = pointsCost + f.monthlyFee.value;
        var roi           = totalMonth / spent;
        
        $(f.pointsIssued.id).val(pointsIssued);
        $(f.pointsCost.id).val(pointsCost);
        $(f.totalMonthly.id).val(totalMonth);
        $(f.roi.id).val(Math.round(roi));
    };
    
    var quickCalculator = function(f){
        var jobValue = parseFloat($(f.jobValue.id).val());
        var points = jobValue * 2;
        var cost = points * 0.012;
        $(f.quickPointsIssued.id).val(points);
        $(f.quickPointsCost.id).val(cost);
    };
    
    var refresh = function(f){
        calculateCustomerSpentMonth(f);
        calculateROI(f);
        quickCalculator(f);
    };
    
    $.each(fields, function(i, el){
        var that = this;
        this.render();
        $(this.id).on('input', function(event){
            that.value = $(this).val();
            refresh(fields);
        });
    });
    
    refresh(fields);
});