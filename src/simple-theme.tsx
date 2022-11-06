import * as React from 'react';
import { useState, useEffect, createContext, useContext, useCallback } from "react"

/**
 * A function that can get the theme value.
 */
export type ThemeGetter = () => Promise<string>

/**
 * A function that can set the theme value.
 */
export type ThemeSetter = (theme: string) => Promise<void>

/**
 * Defines the requirements for being a theme manager.
 */
export interface ThemeManager {
    /**
     * An async function the will return the theme.
     */
    getTheme: ThemeGetter
    /**
     * An async function the will store the theme.
     */
    setTheme: ThemeSetter
}

/**
 * The theme manager context.
 */
const ThemeManagerContext = createContext<ThemeManager | null>(null)

/**
 * The hook to access the theme manager.
 */
export const useThemeManager = () => useContext(ThemeManagerContext)

/**
 * The hook for getting a local storage theme manager.
 * @param key The key to use for getting and setting the theme.
 * @returns A ThemeManager that can be used with the theme detector to allow
 */
export function useLocalStorageThemeManager(key: string): ThemeManager {
    return {
        getTheme: (): Promise<string> => {
            return Promise.resolve(localStorage.getItem(key) || "")
        },
        setTheme: (theme: string) => {
            if (theme) {
                localStorage.setItem(key, theme)
            }
            else {
                localStorage.removeItem(key)
            }
            return Promise.resolve(undefined)
        }
    }
}

const darkThemeQuery = window.matchMedia("(prefers-color-scheme: dark)")

/**
 * The hook to get the current theme from the browser/system.
 * @returns True if the dark theme query is a match, otherwise false.
 */
const useThemeMediaQuery = () => {
    const [isDarkTheme, setIsDarkTheme] = useState(() => darkThemeQuery.matches)
    const onQueryResultsChanged = (e: MediaQueryListEvent) => {
        setIsDarkTheme(e.matches)
    }
    useEffect(() => {
        // On mount we add the results changed listener
        darkThemeQuery.addEventListener("change", onQueryResultsChanged)

        // On unmount we remove the results changed listener
        return () => darkThemeQuery.removeEventListener("change", onQueryResultsChanged)
    }, [])
    return isDarkTheme
}

/**
 * The theme context.
 */
const ThemeContext = createContext<string | null>(null)

/**
 * The hook to access the theme.
 */
export const useTheme = () => useContext(ThemeContext)

/**
 * A function that can receive a theme and return a component.
 */
export type SimpleThemeConsumer = (theme: string) => React.ReactNode

/**
 * The properties for the SimpleTheme component.
 */
export interface SimpleThemeProps {
    /**
     * The theme manager.
     */
    manager?: ThemeManager
    /**
     * The children. This can be components which can utilize the "useTheme" hook or a function that receives the theme.
     */
    children: React.ReactNode | SimpleThemeConsumer
}

/**
 * Provides the detected theme to any descendants.
 */
export function SimpleTheme(props: SimpleThemeProps) {
    const isDarkTheme = useThemeMediaQuery();

    const [managedTheme, setManagedTheme] = useState<string>()

    const onSetTheme = useCallback(async (theme: string): Promise<void> => {
        if (props.manager) {
            await props.manager.setTheme(theme)
        }
        setManagedTheme(theme)
    }, [props.manager])

    useEffect(() => {
        if (props.manager) {
            props.manager.getTheme()
                .then(storedTheme => {
                    setManagedTheme(storedTheme)
                })
        }
    }, [props.manager])

    const theme = managedTheme ?? (isDarkTheme ? "dark" : "light");

    return <ThemeManagerContext.Provider value={props.manager ? { getTheme: props.manager.getTheme, setTheme: onSetTheme } : null}>
        <ThemeContext.Provider value={theme}>
            {typeof props.children === "function" ? props.children(theme) : props.children}
        </ThemeContext.Provider>
    </ThemeManagerContext.Provider>
}