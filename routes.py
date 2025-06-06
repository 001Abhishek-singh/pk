from flask import render_template, request, redirect, url_for, flash, jsonify
from app import app, db
from models import Enquiry, Consultancy, Contact

# Service categories and their services
SERVICE_CATEGORIES = {
    'registration': {
        'name': 'Registration',
        'description': 'Complete business registration services for all types of entities',
        'services': [
            'Company Registration',
            'LLP Registration', 
            'Partnership Firm Registration',
            'Sole Proprietorship Registration',
            'Trust Registration',
            'Society Registration',
            'Producer Company Registration',
            'Section 8 Company Registration'
        ]
    },
    'compliances': {
        'name': 'Compliances',
        'description': 'Comprehensive compliance management for regulatory requirements',
        'services': [
            'Annual Compliance',
            'Monthly Compliance',
            'Quarterly Compliance',
            'ROC Compliance',
            'SEBI Compliance',
            'RBI Compliance',
            'Labour Law Compliance',
            'Environmental Compliance'
        ]
    },
    'incorporate-business': {
        'name': 'Incorporate Business',
        'description': 'End-to-end business incorporation solutions',
        'services': [
            'Private Limited Company',
            'Public Limited Company',
            'One Person Company',
            'Limited Liability Partnership',
            'Branch Office Setup',
            'Subsidiary Company Setup',
            'Representative Office',
            'Liaison Office'
        ]
    },
    'business-structuring': {
        'name': 'Business Structuring',
        'description': 'Strategic business structuring and restructuring services',
        'services': [
            'Corporate Restructuring',
            'Merger & Acquisition',
            'Demerger Services',
            'Spin-off Services',
            'Joint Venture Structuring',
            'Business Valuation',
            'Due Diligence',
            'Corporate Advisory'
        ]
    },
    'taxation': {
        'name': 'Taxation',
        'description': 'Complete tax planning and compliance services',
        'services': [
            'Income Tax Planning',
            'GST Registration & Compliance',
            'Corporate Tax Planning',
            'International Taxation',
            'Tax Audit',
            'Transfer Pricing',
            'Advance Ruling',
            'Tax Litigation'
        ]
    },
    'intellectual-properties': {
        'name': 'Intellectual Properties',
        'description': 'Comprehensive intellectual property protection services',
        'services': [
            'Trademark Registration',
            'Copyright Registration',
            'Patent Filing',
            'Design Registration',
            'Domain Name Registration',
            'IP Licensing',
            'IP Litigation',
            'Brand Protection'
        ]
    },
    'certification-valuation': {
        'name': 'Certification and Valuation',
        'description': 'Professional certification and valuation services',
        'services': [
            'Business Valuation',
            'Asset Valuation',
            'Share Valuation',
            'Startup Valuation',
            'Financial Audit',
            'Internal Audit',
            'Statutory Audit',
            'Certification Services'
        ]
    },
    'banking': {
        'name': 'Banking',
        'description': 'Banking and financial services support',
        'services': [
            'Current Account Opening',
            'Loan Documentation',
            'Project Finance',
            'Bank Guarantee',
            'Letter of Credit',
            'Working Capital Finance',
            'Term Loan Assistance',
            'Banking Compliance'
        ]
    }
}

@app.route('/')
def index():
    return render_template('index.html', service_categories=SERVICE_CATEGORIES)

@app.route('/about')
def about():
    return render_template('about.html', service_categories=SERVICE_CATEGORIES)

@app.route('/services')
def services():
    return render_template('services.html', service_categories=SERVICE_CATEGORIES)

@app.route('/services/<category>')
def service_category(category):
    if category not in SERVICE_CATEGORIES:
        flash('Service category not found', 'error')
        return redirect(url_for('services'))
    
    category_data = SERVICE_CATEGORIES[category]
    return render_template('service_category.html', 
                         category=category, 
                         category_data=category_data)

@app.route('/insights')
def insights():
    return render_template('insights.html', service_categories=SERVICE_CATEGORIES)

@app.route('/contact', methods=['GET', 'POST'])
def contact():
    if request.method == 'POST':
        name = request.form.get('name')
        email = request.form.get('email')
        phone = request.form.get('phone')
        subject = request.form.get('subject')
        message = request.form.get('message')
        
        if not all([name, email, subject, message]):
            flash('Please fill in all required fields', 'error')
            return render_template('contact.html', service_categories=SERVICE_CATEGORIES)
        
        contact_entry = Contact()
        contact_entry.name = name
        contact_entry.email = email
        contact_entry.phone = phone
        contact_entry.subject = subject
        contact_entry.message = message
        
        try:
            db.session.add(contact_entry)
            db.session.commit()
            flash('Thank you for your message. We will get back to you soon!', 'success')
            return redirect(url_for('contact'))
        except Exception as e:
            db.session.rollback()
            flash('There was an error submitting your message. Please try again.', 'error')
            app.logger.error(f"Contact form error: {e}")
    
    return render_template('contact.html', service_categories=SERVICE_CATEGORIES)

@app.route('/enquiry/<category>', methods=['GET', 'POST'])
def enquiry(category):
    if category not in SERVICE_CATEGORIES:
        flash('Service category not found', 'error')
        return redirect(url_for('services'))
    
    if request.method == 'POST':
        name = request.form.get('name')
        email = request.form.get('email')
        phone = request.form.get('phone')
        location = request.form.get('location')
        message = request.form.get('message', '')
        
        if not all([name, email, phone, location]):
            flash('Please fill in all required fields', 'error')
            return render_template('enquiry.html', 
                                 category=category, 
                                 category_data=SERVICE_CATEGORIES[category])
        
        enquiry_entry = Enquiry()
        enquiry_entry.name = name
        enquiry_entry.email = email
        enquiry_entry.phone = phone
        enquiry_entry.location = location
        enquiry_entry.service_category = category
        enquiry_entry.message = message
        
        try:
            db.session.add(enquiry_entry)
            db.session.commit()
            flash('Thank you for your enquiry. We will contact you soon!', 'success')
            return redirect(url_for('service_category', category=category))
        except Exception as e:
            db.session.rollback()
            flash('There was an error submitting your enquiry. Please try again.', 'error')
            app.logger.error(f"Enquiry form error: {e}")
    
    return render_template('enquiry.html', 
                         category=category, 
                         category_data=SERVICE_CATEGORIES[category])

@app.route('/consultancy', methods=['GET', 'POST'])
def consultancy():
    if request.method == 'POST':
        name = request.form.get('name')
        phone = request.form.get('phone')
        location = request.form.get('location')
        message = request.form.get('message')
        
        if not all([name, phone, location, message]):
            flash('Please fill in all required fields', 'error')
            return render_template('consultancy.html', service_categories=SERVICE_CATEGORIES)
        
        consultancy_entry = Consultancy()
        consultancy_entry.name = name
        consultancy_entry.phone = phone
        consultancy_entry.location = location
        consultancy_entry.message = message
        
        try:
            db.session.add(consultancy_entry)
            db.session.commit()
            flash('Thank you for your consultation request. We will call you back soon!', 'success')
            return redirect(url_for('consultancy'))
        except Exception as e:
            db.session.rollback()
            flash('There was an error submitting your request. Please try again.', 'error')
            app.logger.error(f"Consultancy form error: {e}")
    
    return render_template('consultancy.html', service_categories=SERVICE_CATEGORIES)

@app.route('/search')
def search():
    query = request.args.get('q', '').lower()
    results = []
    
    if query:
        for category_key, category_data in SERVICE_CATEGORIES.items():
            # Search in category name
            if query in category_data['name'].lower():
                results.append({
                    'type': 'category',
                    'name': category_data['name'],
                    'url': url_for('service_category', category=category_key)
                })
            
            # Search in services
            for service in category_data['services']:
                if query in service.lower():
                    results.append({
                        'type': 'service',
                        'name': service,
                        'category': category_data['name'],
                        'url': url_for('service_category', category=category_key)
                    })
    
    return jsonify(results)
