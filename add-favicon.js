const fs = require('fs');

const filePath = 'src/app/app/[tenant]/admin/settings/WorkspaceSettingsForm.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add state variable
if (!content.includes('const [faviconUrl, setFaviconUrl] = useState(settings.faviconUrl);')) {
  content = content.replace(
    'const [logoUrl, setLogoUrl] = useState(settings.logoUrl);',
    'const [logoUrl, setLogoUrl] = useState(settings.logoUrl);\n  const [faviconUrl, setFaviconUrl] = useState(settings.faviconUrl);'
  );
}

// 2. Add to useEffect
if (!content.includes('setFaviconUrl(settings.faviconUrl);')) {
  content = content.replace(
    'setLogoUrl(settings.logoUrl);',
    'setLogoUrl(settings.logoUrl);\n    setFaviconUrl(settings.faviconUrl);'
  );
}

// 3. Add to handleSubmit
if (!content.includes('faviconUrl,')) {
  content = content.replace(
    'logoUrl,\n        primaryColor,',
    'logoUrl,\n        faviconUrl,\n        primaryColor,'
  );
}

// 4. Add ImageUpload UI
// Let's find the Logo ImageUpload
const logoUiString = '<ImageUpload value={logoUrl || ""} onChange={setLogoUrl} label="Workspace Logo" folder={`${mediaFolderBase}/branding`} />';
const faviconUiString = '\n                    <ImageUpload value={faviconUrl || ""} onChange={setFaviconUrl} label="Favicon (Optional, defaults to Logo)" folder={`${mediaFolderBase}/branding`} />';

if (content.includes(logoUiString) && !content.includes('Favicon (Optional')) {
  content = content.replace(
    logoUiString,
    logoUiString + faviconUiString
  );
} else {
    // maybe single quotes?
    console.log("Could not find exact Logo ImageUpload string, try generic replace");
    content = content.replace(
        /(<ImageUpload[^>]+onChange={setLogoUrl}[^>]*\/>)/,
        '$1\n                    <ImageUpload value={faviconUrl || ""} onChange={setFaviconUrl} label="Favicon (Optional, defaults to Logo)" folder={`${mediaFolderBase}/branding`} />'
    );
}

fs.writeFileSync(filePath, content, 'utf8');
console.log("WorkspaceSettingsForm updated.");
