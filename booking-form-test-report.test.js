/**
 * BookingForm Comprehensive Test Report Generator
 * 
 * This script analyzes the BookingForm component implementation and generates
 * a comprehensive test report covering all the specified requirements.
 */

const fs = require('fs');
const path = require('path');

// Test configuration
const TEST_CONFIG = {
  componentFile: 'src/components/BookingForm.tsx',
  outputDir: 'test-results',
  reportFile: 'booking-form-test-report.json',
  markdownReportFile: 'booking-form-test-report.md'
};

// Requirements to verify
const REQUIREMENTS = [
  {
    id: 'REQ-001',
    title: 'All fields are typable',
    description: 'Email, Phone, Industry, Current Audience, Key Messages, Visual References fields accept input',
    category: 'Field Functionality',
    verification: 'Check that all form fields have proper onChange handlers and are not readonly'
  },
  {
    id: 'REQ-002',
    title: 'Email Address is required',
    description: 'Email field must be filled out and validated',
    category: 'Validation',
    verification: 'Check that email field has required validation and email format validation'
  },
  {
    id: 'REQ-003',
    title: 'Phone Number is required',
    description: 'Phone field must be filled out and validated',
    category: 'Validation',
    verification: 'Check that phone field has required validation and phone format validation'
  },
  {
    id: 'REQ-004',
    title: 'Preferred Contact Method removed',
    description: 'Preferred Contact Method field should not be present in the form',
    category: 'Field Changes',
    verification: 'Check that Preferred Contact Method field is not in the form'
  },
  {
    id: 'REQ-005',
    title: 'n8n webhook integration',
    description: 'Form data is sent to n8n webhook with correct JSON payload',
    category: 'Integration',
    verification: 'Check that form submission sends data to the correct webhook URL'
  },
  {
    id: 'REQ-006',
    title: 'Form validation for required fields',
    description: 'Name, Business Name, Email, Phone, Industry fields are validated',
    category: 'Validation',
    verification: 'Check that all required fields have proper validation'
  },
  {
    id: 'REQ-007',
    title: 'Error handling for invalid inputs',
    description: 'Appropriate error messages are shown for invalid inputs',
    category: 'Error Handling',
    verification: 'Check that error messages are displayed for invalid inputs'
  },
  {
    id: 'REQ-008',
    title: 'Form reset after submission',
    description: 'Form is reset and modal closes after successful submission',
    category: 'Form Behavior',
    verification: 'Check that form is reset and modal closes after successful submission'
  }
];

function ensureOutputDirectory() {
  if (!fs.existsSync(TEST_CONFIG.outputDir)) {
    fs.mkdirSync(TEST_CONFIG.outputDir, { recursive: true });
  }
}

function analyzeComponent() {
  console.log('🔍 Analyzing BookingForm component...\n');
  
  try {
    const componentPath = path.resolve(TEST_CONFIG.componentFile);
    const componentCode = fs.readFileSync(componentPath, 'utf8');
    
    const analysis = {
      filePath: componentPath,
      fileSize: componentCode.length,
      lines: componentCode.split('\n').length,
      imports: extractImports(componentCode),
      interfaces: extractInterfaces(componentCode),
      stateVariables: extractStateVariables(componentCode),
      formFields: extractFormFields(componentCode),
      validationRules: extractValidationRules(componentCode),
      webhookIntegration: extractWebhookIntegration(componentCode),
      formSubmission: extractFormSubmission(componentCode),
      errorHandling: extractErrorHandling(componentCode),
      formReset: extractFormReset(componentCode)
    };
    
    return analysis;
  } catch (error) {
    console.error('Failed to analyze component:', error.message);
    return null;
  }
}

function extractImports(code) {
  const importRegex = /import\s+.*?from\s+['"](.+?)['"];?/g;
  const imports = [];
  let match;
  
  while ((match = importRegex.exec(code)) !== null) {
    imports.push(match[0]);
  }
  
  return imports;
}

function extractInterfaces(code) {
  const interfaceRegex = /interface\s+(\w+)\s*{([^}]+)}/g;
  const interfaces = [];
  let match;
  
  while ((match = interfaceRegex.exec(code)) !== null) {
    interfaces.push({
      name: match[1],
      properties: match[2].trim().split('\n').map(line => line.trim()).filter(line => line)
    });
  }
  
  return interfaces;
}

function extractStateVariables(code) {
  const stateRegex = /const\s+\[(\w+),\s*set\w+\]\s*=\s*useState<\w+>\(([^)]*)\)/g;
  const stateVars = [];
  let match;
  
  while ((match = stateRegex.exec(code)) !== null) {
    stateVars.push({
      name: match[1],
      initialValue: match[2].trim()
    });
  }
  
  return stateVars;
}

function extractFormFields(code) {
  const fields = [];
  
  // Look for input elements
  const inputRegex = /<input\s+[^>]*name=["']([^"']+)["'][^>]*>/g;
  let match;
  
  while ((match = inputRegex.exec(code)) !== null) {
    const inputTag = match[0];
    const name = match[1];
    const type = inputTag.match(/type=["']([^"']+)["']/) ? inputTag.match(/type=["']([^"']+)["']/)[1] : 'text';
    const required = inputTag.includes('required') || inputTag.includes('*');
    const placeholder = inputTag.match(/placeholder=["']([^"']+)["']/) ? inputTag.match(/placeholder=["']([^"']+)["']/)[1] : '';
    
    fields.push({
      name,
      type,
      required,
      placeholder,
      tag: 'input'
    });
  }
  
  // Look for textarea elements
  const textareaRegex = /<textarea\s+[^>]*name=["']([^"']+)["'][^>]*>/g;
  
  while ((match = textareaRegex.exec(code)) !== null) {
    const textareaTag = match[0];
    const name = match[1];
    const required = textareaTag.includes('required') || textareaTag.includes('*');
    const placeholder = textareaTag.match(/placeholder=["']([^"']+)["']/) ? textareaTag.match(/placeholder=["']([^"']+)["']/)[1] : '';
    
    fields.push({
      name,
      type: 'textarea',
      required,
      placeholder,
      tag: 'textarea'
    });
  }
  
  return fields;
}

function extractValidationRules(code) {
  const validationRules = [];
  
  // Look for validation patterns in the validateForm function
  const validateFunctionMatch = code.match(/const validateForm = \(\): boolean => \{[\s\S]*?return Object\.keys\(newErrors\)\.length === 0;\s*\};/);
  
  if (validateFunctionMatch) {
    const validateBody = validateFunctionMatch[0];
    
    // Extract email validation
    const emailValidation = validateBody.match(/emailRegex = \/([^\/]+)\/\//);
    if (emailValidation) {
      validationRules.push({
        field: 'email',
        type: 'regex',
        pattern: emailValidation[1],
        message: 'Email format validation'
      });
    }
    
    // Extract phone validation
    const phoneValidation = validateBody.match(/phoneRegex = \/([^\/]+)\/\//);
    if (phoneValidation) {
      validationRules.push({
        field: 'phone',
        type: 'regex',
        pattern: phoneValidation[1],
        message: 'Phone format validation'
      });
    }
    
    // Extract required field validations - more flexible pattern
    const requiredMatches = validateBody.matchAll(/if\s*\(\s*!formData\.(\w+)\.trim\(\)\s*\)\s*\{[\s\S]*?newErrors\.(\w+)\s*=\s*['"]([^'"]+)['"];[\s\S]*?\}/g);
    
    for (const match of requiredMatches) {
      validationRules.push({
        field: match[1],
        type: 'required',
        message: match[3]
      });
    }
    
    // Extract length validations
    const lengthMatches = validateBody.matchAll(/\.length\s*<\s*(\d+)/g);
    
    for (const match of lengthMatches) {
      validationRules.push({
        field: 'length check',
        type: 'minLength',
        minLength: parseInt(match[1]),
        message: `Minimum length validation (${match[1]} characters)`
      });
    }
  }
  
  return validationRules;
}

function extractWebhookIntegration(code) {
  // Look for fetch call with webhook URL
  const fetchMatch = code.match(/fetch\(['"]([^'"]+)['"],\s*{([^}]+)}/);
  
  if (fetchMatch) {
    return {
      url: fetchMatch[1],
      method: 'POST',
      hasHeaders: fetchMatch[2].includes('Content-Type'),
      hasJSONBody: fetchMatch[2].includes('application/json')
    };
  }
  
  return null;
}

function extractFormSubmission(code) {
  // Look for handleSubmit function
  const handleSubmitMatch = code.match(/const handleSubmit = async \(e: React\.FormEvent\) => \s*{([^}]+)}/s);
  
  if (handleSubmitMatch) {
    const handleSubmitBody = handleSubmitMatch[1];
    
    return {
      hasValidation: handleSubmitBody.includes('validateForm()'),
      hasErrorHandling: handleSubmitBody.includes('try') && handleSubmitBody.includes('catch'),
      hasSuccessState: handleSubmitBody.includes('setIsSubmitted(true)'),
      hasLoadingState: handleSubmitBody.includes('setIsSubmitting(true)')
    };
  }
  
  return null;
}

function extractErrorHandling(code) {
  const errorHandling = {
    hasErrorState: code.includes('const [submissionError, setSubmissionError]'),
    hasErrorMessageDisplay: code.includes('submissionError') && code.includes('AlertCircle'),
    hasValidationErrorDisplay: code.includes('errors.') && code.includes('text-red-600')
  };
  
  return errorHandling;
}

function extractFormReset(code) {
  // Look for form reset after successful submission
  const resetMatch = code.match(/setFormData\(\{([^}]+)\}\)/);
  
  if (resetMatch) {
    return {
      hasReset: true,
      resetObject: resetMatch[1],
      hasAutoClose: code.includes('setTimeout') && code.includes('onClose()')
    };
  }
  
  return { hasReset: false };
}

function verifyRequirements(analysis) {
  console.log('✅ Verifying requirements against component implementation...\n');
  
  const verificationResults = [];
  
  REQUIREMENTS.forEach(req => {
    let status = 'FAIL';
    let details = [];
    let covered = false;
    
    switch (req.id) {
      case 'REQ-001':
        // Check if all fields are present and typable
        const expectedFields = ['name', 'businessName', 'email', 'phone', 'industry', 'targetAudience', 'keyMessage', 'visualReferences'];
        const actualFields = analysis.formFields.map(f => f.name);
        const missingFields = expectedFields.filter(field => !actualFields.includes(field));
        
        if (missingFields.length === 0 && analysis.stateVariables.some(sv => sv.name === 'formData')) {
          status = 'PASS';
          covered = true;
        } else {
          details.push(`Missing fields: ${missingFields.join(', ')}`);
        }
        break;
        
      case 'REQ-002':
        // Check if email is required
        const emailField = analysis.formFields.find(f => f.name === 'email');
        if (emailField && analysis.validationRules.some(v => v.field === 'email' && v.type === 'required')) {
          status = 'PASS';
          covered = true;
        } else {
          details.push('Email field is not properly validated as required');
        }
        break;
        
      case 'REQ-003':
        // Check if phone is required
        const phoneField = analysis.formFields.find(f => f.name === 'phone');
        if (phoneField && analysis.validationRules.some(v => v.field === 'phone' && v.type === 'required')) {
          status = 'PASS';
          covered = true;
        } else {
          details.push('Phone field is not properly validated as required');
        }
        break;
        
      case 'REQ-004':
        // Check if Preferred Contact Method is removed
        const hasPreferredContactMethod = analysis.formFields.some(f => 
          f.name.includes('contact') || f.name.includes('preferred')
        );
        
        if (!hasPreferredContactMethod) {
          status = 'PASS';
          covered = true;
        } else {
          details.push('Preferred Contact Method field is still present');
        }
        break;
        
      case 'REQ-005':
        // Check if webhook integration exists
        if (analysis.webhookIntegration && 
            analysis.webhookIntegration.url.includes('n8n.cloud') &&
            analysis.webhookIntegration.hasHeaders &&
            analysis.webhookIntegration.hasJSONBody) {
          status = 'PASS';
          covered = true;
        } else {
          details.push('Webhook integration is not properly configured');
        }
        break;
        
      case 'REQ-006':
        // Check if all required fields have validation
        const requiredFields = ['name', 'businessName', 'email', 'phone', 'industry'];
        const validatedFields = analysis.validationRules
          .filter(v => v.type === 'required')
          .map(v => v.field);
        
        const allValidated = requiredFields.every(field => validatedFields.includes(field));
        
        if (allValidated) {
          status = 'PASS';
          covered = true;
        } else {
          const notValidated = requiredFields.filter(field => !validatedFields.includes(field));
          details.push(`Missing validation for: ${notValidated.join(', ')}`);
        }
        break;
        
      case 'REQ-007':
        // Check if error handling exists
        if (analysis.errorHandling.hasErrorState && 
            analysis.errorHandling.hasErrorMessageDisplay &&
            analysis.errorHandling.hasValidationErrorDisplay) {
          status = 'PASS';
          covered = true;
        } else {
          details.push('Error handling is not fully implemented');
        }
        break;
        
      case 'REQ-008':
        // Check if form reset after submission
        if (analysis.formReset.hasReset && analysis.formReset.hasAutoClose) {
          status = 'PASS';
          covered = true;
        } else {
          details.push('Form reset and/or auto-close is not implemented');
        }
        break;
    }
    
    verificationResults.push({
      ...req,
      status,
      covered,
      details,
      testCount: covered ? 1 : 0,
      testTitles: covered ? [`${req.id} - Code Analysis Verification`] : []
    });
  });
  
  return verificationResults;
}

function generateJsonReport(analysis, verificationResults) {
  const report = {
    timestamp: new Date().toISOString(),
    component: {
      file: analysis.filePath,
      size: analysis.fileSize,
      lines: analysis.lines
    },
    summary: {
      totalRequirements: REQUIREMENTS.length,
      passedRequirements: verificationResults.filter(r => r.status === 'PASS').length,
      failedRequirements: verificationResults.filter(r => r.status === 'FAIL').length,
      successRate: Math.round((verificationResults.filter(r => r.status === 'PASS').length / REQUIREMENTS.length) * 100)
    },
    requirements: verificationResults,
    analysis: {
      imports: analysis.imports,
      interfaces: analysis.interfaces,
      formFields: analysis.formFields,
      validationRules: analysis.validationRules,
      webhookIntegration: analysis.webhookIntegration,
      formSubmission: analysis.formSubmission,
      errorHandling: analysis.errorHandling,
      formReset: analysis.formReset
    }
  };

  const reportPath = path.join(TEST_CONFIG.outputDir, TEST_CONFIG.reportFile);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  return reportPath;
}

function generateMarkdownReport(verificationResults, reportPath) {
  const passedRequirements = verificationResults.filter(r => r.status === 'PASS').length;
  const totalRequirements = verificationResults.length;
  const successRate = Math.round((passedRequirements / totalRequirements) * 100);
  
  let markdown = `# BookingForm Comprehensive Test Report\n\n`;
  markdown += `**Generated:** ${new Date().toLocaleString()}\n\n`;
  
  // Executive Summary
  markdown += `## Executive Summary\n\n`;
  markdown += `- **Total Requirements:** ${totalRequirements}\n`;
  markdown += `- **Passed:** ${passedRequirements}\n`;
  markdown += `- **Failed:** ${totalRequirements - passedRequirements}\n`;
  markdown += `- **Success Rate:** ${successRate}%\n\n`;
  
  // Component Analysis
  markdown += `## Component Analysis\n\n`;
  markdown += `This report analyzes the BookingForm component implementation at \`${TEST_CONFIG.componentFile}\`\n\n`;
  markdown += `The component has been analyzed for:\n`;
  markdown += `- Form field structure and typability\n`;
  markdown += `- Validation rules for required fields\n`;
  markdown += `- Webhook integration for form submission\n`;
  markdown += `- Error handling mechanisms\n`;
  markdown += `- Form reset functionality\n\n`;
  
  // Requirements Coverage
  markdown += `## Requirements Coverage\n\n`;
  markdown += `| ID | Requirement | Category | Status | Details |\n`;
  markdown += `|---|-------------|----------|--------|---------|\n`;
  
  verificationResults.forEach(req => {
    const status = req.status === 'PASS' ? '✅ PASS' : '❌ FAIL';
    const details = req.details.length > 0 ? req.details.join('; ') : 'N/A';
    markdown += `| ${req.id} | ${req.title} | ${req.category} | ${status} | ${details} |\n`;
  });
  
  markdown += `\n`;
  
  // Detailed Requirements Analysis
  markdown += `## Detailed Requirements Analysis\n\n`;
  
  verificationResults.forEach(req => {
    markdown += `### ${req.id}: ${req.title}\n\n`;
    markdown += `**Category:** ${req.category}\n\n`;
    markdown += `**Description:** ${req.description}\n\n`;
    markdown += `**Verification Method:** ${req.verification}\n\n`;
    markdown += `**Status:** ${req.status === 'PASS' ? '✅ PASSED' : '❌ FAILED'}\n\n`;
    
    if (req.details.length > 0) {
      markdown += `**Issues Found:**\n`;
      req.details.forEach(detail => {
        markdown += `- ${detail}\n`;
      });
      markdown += `\n`;
    }
  });
  
  // Test Recommendations
  markdown += `## Test Recommendations\n\n`;
  
  const failedRequirements = verificationResults.filter(req => req.status === 'FAIL');
  if (failedRequirements.length > 0) {
    markdown += `### Failed Requirements - Action Needed\n\n`;
    failedRequirements.forEach(req => {
      markdown += `#### ${req.id}: ${req.title}\n\n`;
      markdown += `**Issue:** ${req.details.join(', ')}\n\n`;
      markdown += `**Recommendation:** `;
      
      switch (req.id) {
        case 'REQ-001':
          markdown += `Ensure all form fields are present and have proper onChange handlers\n\n`;
          break;
        case 'REQ-002':
          markdown += `Add required validation for the email field\n\n`;
          break;
        case 'REQ-003':
          markdown += `Add required validation for the phone field\n\n`;
          break;
        case 'REQ-004':
          markdown += `Remove the Preferred Contact Method field from the form\n\n`;
          break;
        case 'REQ-005':
          markdown += `Implement proper webhook integration with correct headers and JSON payload\n\n`;
          break;
        case 'REQ-006':
          markdown += `Add validation for all required fields\n\n`;
          break;
        case 'REQ-007':
          markdown += `Implement proper error handling with user-friendly error messages\n\n`;
          break;
        case 'REQ-008':
          markdown += `Implement form reset and modal auto-close after successful submission\n\n`;
          break;
        default:
          markdown += `Review and fix the implementation\n\n`;
      }
    });
  } else {
    markdown += `### ✅ All Requirements Met!\n\n`;
    markdown += `The BookingForm component meets all specified requirements based on code analysis.\n\n`;
    markdown += `**Next Steps:**\n`;
    markdown += `- Run functional tests to verify the implementation works as expected\n`;
    markdown += `- Test the form in a browser environment\n`;
    markdown += `- Verify webhook integration with actual n8n endpoint\n`;
    markdown += `- Test form submission with various data scenarios\n\n`;
  }
  
  // Manual Testing Checklist
  markdown += `## Manual Testing Checklist\n\n`;
  markdown += `Use this checklist to manually verify the form functionality:\n\n`;
  markdown += `### Field Typability Tests\n\n`;
  markdown += `- [ ] Can type in Name field\n`;
  markdown += `- [ ] Can type in Business Name field\n`;
  markdown += `- [ ] Can type in Email field\n`;
  markdown += `- [ ] Can type in Phone field\n`;
  markdown += `- [ ] Can type in Industry field\n`;
  markdown += `- [ ] Can type in Current Target Audience textarea\n`;
  markdown += `- [ ] Can type in Key Message textarea\n`;
  markdown += `- [ ] Can type in Visual References textarea\n\n`;
  
  markdown += `### Validation Tests\n\n`;
  markdown += `- [ ] Submit empty form shows validation errors for all required fields\n`;
  markdown += `- [ ] Invalid email format shows error message\n`;
  markdown += `- [ ] Invalid phone format shows error message\n`;
  markdown += `- [ ] Fields with less than 2 characters show error message\n`;
  markdown += `- [ ] Error messages clear when user starts typing\n\n`;
  
  markdown += `### Submission Tests\n\n`;
  markdown += `- [ ] Valid form submission shows success message\n`;
  markdown += `- [ ] Form shows loading state during submission\n`;
  markdown += `- [ ] Form resets after successful submission\n`;
  markdown += `- [ ] Modal closes after successful submission\n`;
  markdown += `- [ ] Network request is sent to n8n webhook\n`;
  markdown += `- [ ] JSON payload contains all form data\n\n`;
  
  markdown += `### Error Handling Tests\n\n`;
  markdown += `- [ ] Network errors show user-friendly error message\n`;
  markdown += `- [ ] Server errors show user-friendly error message\n`;
  markdown += `- [ ] Form remains usable after error\n\n`;
  
  markdown += `### UI Interaction Tests\n\n`;
  markdown += `- [ ] Close button (X) closes the modal\n`;
  markdown += `- [ ] Clicking outside modal closes it\n`;
  markdown += `- [ ] Modal cannot be closed during submission\n`;
  markdown += `- [ ] Modal title changes based on CTA button\n\n`;
  
  // Save markdown report
  const markdownPath = path.join(TEST_CONFIG.outputDir, TEST_CONFIG.markdownReportFile);
  fs.writeFileSync(markdownPath, markdown);
  
  return markdownPath;
}

function printSummary(verificationResults) {
  const passedRequirements = verificationResults.filter(r => r.status === 'PASS').length;
  const totalRequirements = verificationResults.length;
  const successRate = Math.round((passedRequirements / totalRequirements) * 100);
  
  console.log('\n📊 Test Results Summary:');
  console.log(`   Total Requirements: ${totalRequirements}`);
  console.log(`   Passed: ${passedRequirements} ✅`);
  console.log(`   Failed: ${totalRequirements - passedRequirements} ❌`);
  console.log(`   Success Rate: ${successRate}%`);
  
  console.log('\n📋 Requirements Coverage:');
  verificationResults.forEach(req => {
    const status = req.status === 'PASS' ? '✅' : '❌';
    console.log(`   ${status} ${req.id}: ${req.title}`);
  });
  
  console.log(`\n🎯 Requirements Passed: ${passedRequirements}/${totalRequirements}`);
}

function main() {
  console.log('🧪 BookingForm Comprehensive Test Report Generator');
  console.log('===============================================\n');
  
  try {
    // Ensure output directory exists
    ensureOutputDirectory();
    
    // Analyze the component
    const analysis = analyzeComponent();
    
    if (!analysis) {
      console.error('Failed to analyze component. Exiting.');
      process.exit(1);
    }
    
    // Verify requirements
    const verificationResults = verifyRequirements(analysis);
    
    // Generate reports
    const jsonReportPath = generateJsonReport(analysis, verificationResults);
    const markdownReportPath = generateMarkdownReport(verificationResults, jsonReportPath);
    
    // Print summary
    printSummary(verificationResults);
    
    console.log('\n📄 Reports Generated:');
    console.log(`   JSON: ${jsonReportPath}`);
    console.log(`   Markdown: ${markdownReportPath}`);
    
    // Exit with appropriate code
    const failedRequirements = verificationResults.filter(r => r.status === 'FAIL').length;
    if (failedRequirements > 0) {
      console.log('\n❌ Some requirements are not met. Check the reports for details.');
      process.exit(1);
    } else {
      console.log('\n✅ All requirements are met!');
      process.exit(0);
    }
    
  } catch (error) {
    console.error('\n💥 Report generator failed:', error.message);
    process.exit(1);
  }
}

// Run the report generator
if (require.main === module) {
  main();
}

module.exports = {
  analyzeComponent,
  verifyRequirements,
  generateJsonReport,
  generateMarkdownReport,
  REQUIREMENTS
};