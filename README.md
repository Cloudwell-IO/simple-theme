# Cloudwell Simple Theme
A React component to easily provide the system, browser, user defined theme to every component in an app.

## How to install:
```powershell
npm i @cloudwell/simple-theme
```

## Examples

### Detect system/browser theme preference
This example doesn't include any user interaction but will provide the current light/dark theme based on browser settings and fall back to system settings when browser settings are not specified.

```jsx
import { SimpleTheme, useTheme } from '@cloudwell/simple-theme';

export function App(): JSX.Element {
    return <SimpleTheme>
        {theme => <>
            <div>Current Theme is {theme}</div>
            <br />
            <MyThemeConsumer />
        </>}
    </SimpleTheme>
}

function MyThemeConsumer(): JSX.Element {
    const theme = useTheme()
    return <div>The useTheme hook returns {theme}</div>
}
```

### User can persist a theme in local storage or revert to system/browser theme preference
This example allows the user to choose a light, dark, or custom theme and save it using the build in local storage theme manager. It will provide the current stored theme or the detected light/dark theme based on browser preferences and will fall back to system preferences when browser preferences are not specified.

```jsx
import { SimpleTheme, useLocalStorageThemeManager, useTheme } from '@cloudwell/simple-theme';
export function App(): JSX.Element {

    // The value "theme" here defines the key in local storage.
    const themeManager = useLocalStorageThemeManager("theme")
    
    return <SimpleTheme manager={themeManager}>
        {theme => <>
            <div>Current Theme is {theme}</div>
            <br />
            <MyThemeConsumer />
            <br />
            <button onClick={() => themeManager.setTheme("light")} >Light</button>
            <br />
            <button onClick={() => themeManager.setTheme("dark")} >Dark</button>
            <br />
            <button onClick={() => themeManager.setTheme("custom")} >Custom</button>
            <br />
            <button onClick={() => themeManager.setTheme("")} >System/Browser</button>
        </>}
    </SimpleTheme>
}

function MyThemeConsumer(): JSX.Element {
    const theme = useTheme()
    return <div>The useTheme hook returns {theme}</div>
}
```

### User can persist a theme with custom API or revert to system/browser theme preference
This example allows the user to choose a light, dark, or custom theme and stores by calling an API. It will provide the current stored theme or the detected light/dark theme based on browser preferences and will fall back to system preferences when browser preferences are not specified.

```jsx
import { SimpleTheme, ThemeManager, useThemeManager, useTheme } from '@cloudwell/simple-theme';

const themeManager: ThemeManager = {
    getTheme: () => new Promise<string>(async (resolve) => {
        // TODO: Replace this API call with a real one
        const theme = await fetch("api/getUserTheme")
        resolve(theme)
    }),
    setTheme: (theme: string) => new Promise<void>(async (resolve) => {
        // TODO: Replace this API call with a real one
        await fetch("api/setUserTheme?theme=" + theme)
        resolve()
    })
}

export function App(): JSX.Element {
    return <SimpleTheme manager={themeManager}>
        {theme => <>
            <div>Current Theme is {theme}</div>
            <br />
            <MyThemeConsumer />
            <br />
            <MyThemeUpdater />
        </>}
    </SimpleTheme>
}

function MyThemeConsumer(): JSX.Element {
    const theme = useTheme()
    return <div>The useTheme hook returns {theme}</div>
}

function MyThemeUpdater(): JSX.Element {
    const themeManager = useThemeManager()
    return <>
        <button onClick={() => themeManager.setTheme("light")} >Light</button>
        <br />
        <button onClick={() => themeManager.setTheme("dark")} >Dark</button>
        <br />
        <button onClick={() => themeManager.setTheme("custom")} >Custom</button>
        <br />
        <button onClick={() => themeManager.setTheme("")} >System/Browser</button>
    </>
}
```

## Implementation

### ThemeGetter type
The type of function that can get the theme value.

### ThemeSetter type
The type of function that can set the theme value.

### ThemeManager interface

|Name|Type|Description|
|:---|:---|:---|
|**getTheme**|ThemeGetter|**Required**. An async function the will return the theme.|
|**setTheme**|ThemeSetter|**Required**. An async function the will store the theme.|

## useTheme hook
The hook to access the theme.

## useThemeManager hook
The hook to access the theme manager.

## useLocalStorageThemeManager hook
The hook for getting a local storage theme manager.
It requires a parameter called `key` which can be any string value and will be used to read and write the theme name to local storage.

### SimpleThemeConsumer type
The type of function that can receive a theme and return a component.

## SimpleThemeProps interface

|Name|Type|Description|
|:---|:---|:---|
|**manager**|string|**Optional**. The theme manager.|
|**children**|SimpleThemeConsumer \| React.ReactNode|**Optional**. The children. This can be components which can utilize the "useTheme" hook or a function that receives the theme.|
