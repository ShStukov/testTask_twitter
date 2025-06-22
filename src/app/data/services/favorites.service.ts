import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class FavoritesService {
    private readonly FAVORITES_STORAGE_KEY = 'favoritePostIds';
    private _favoritePostIds = new BehaviorSubject<number[]>(this.loadFavorites())
    public readonly favoritePostIds$: Observable<number[]> = this._favoritePostIds.asObservable();

    constructor() { }

    private loadFavorites(): number[] {
        try {
            const storedFavorites = localStorage.getItem(this.FAVORITES_STORAGE_KEY);
            return storedFavorites ? JSON.parse(storedFavorites) : [];
        } catch (e) {
            console.error('Error loading for localStorage', e);
            return [];
        }
    }

    private saveFavorites(ids: number[]): void {
        try {
            localStorage.setItem(this.FAVORITES_STORAGE_KEY, JSON.stringify(ids));
        } catch (e) {
            console.error('Error saving to localStorage', e);
        }
    }

    addFavorite(postId: number): void {
        const currentFavorites = this._favoritePostIds.getValue();
        if (!currentFavorites.includes(postId)) {
            const updatedFavorites = [...currentFavorites, postId];
            this._favoritePostIds.next(updatedFavorites);
            this.saveFavorites(updatedFavorites);
        }
    }

    removeFavorite(postId: number): void {
        const currentFavorites = this._favoritePostIds.getValue();
        const updatedFavorites = currentFavorites.filter(id => id !== postId);
        if (updatedFavorites.length !== currentFavorites.length) {
            this._favoritePostIds.next(updatedFavorites);
            this.saveFavorites(updatedFavorites);
        }
    }

    isFavorite(postId: number): boolean {
        return this._favoritePostIds.getValue().includes(postId);
    }

    getFavoritePostIds(): number[] {
        return this._favoritePostIds.getValue();
    }
}