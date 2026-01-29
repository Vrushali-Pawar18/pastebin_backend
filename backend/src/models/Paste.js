/**
 * Paste Model
 * Represents a text paste with optional expiration
 */

const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');
const { EXPIRATION_TYPES } = require('../config/constants');

class Paste extends Model {
    /**
     * Check if paste has expired based on time
     * @returns {boolean}
     */
    isTimeExpired() {
        if (!this.expires_at) return false;
        return new Date() > new Date(this.expires_at);
    }

    /**
     * Check if paste has expired based on view count
     * @returns {boolean}
     */
    isViewExpired() {
        if (!this.max_views) return false;
        return this.view_count >= this.max_views;
    }

    /**
     * Check if paste has expired (either time or views)
     * @returns {boolean}
     */
    isExpired() {
        return this.isTimeExpired() || this.isViewExpired();
    }

    /**
     * Get remaining views
     * @returns {number|null}
     */
    getRemainingViews() {
        if (!this.max_views) return null;
        return Math.max(0, this.max_views - this.view_count);
    }

    /**
     * Get time remaining until expiration
     * @returns {number|null} - Milliseconds remaining, or null if no time expiration
     */
    getTimeRemaining() {
        if (!this.expires_at) return null;
        const remaining = new Date(this.expires_at) - new Date();
        return Math.max(0, remaining);
    }

    /**
     * Increment view count and check for expiration
     * @returns {Promise<{expired: boolean, reason?: string}>}
     */
    async incrementView() {
        this.view_count += 1;
        await this.save();

        if (this.isViewExpired()) {
            return { expired: true, reason: 'views' };
        }
        if (this.isTimeExpired()) {
            return { expired: true, reason: 'time' };
        }
        return { expired: false };
    }

    /**
     * Convert to safe JSON (excludes sensitive data if needed)
     * @returns {Object}
     */
    toSafeJSON() {
        return {
            id: this.id,
            content: this.content,
            title: this.title,
            syntax: this.syntax,
            expiration_type: this.expiration_type,
            expires_at: this.expires_at,
            max_views: this.max_views,
            view_count: this.view_count,
            remaining_views: this.getRemainingViews(),
            time_remaining: this.getTimeRemaining(),
            created_at: this.created_at,
            is_expired: this.isExpired()
        };
    }
}

Paste.init(
    {
        id: {
            type: DataTypes.STRING(16),
            primaryKey: true,
            allowNull: false
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: 'Content cannot be empty'
                },
                len: {
                    args: [1, 512000],
                    msg: 'Content must be between 1 and 512000 characters'
                }
            }
        },
        title: {
            type: DataTypes.STRING(255),
            allowNull: true,
            defaultValue: 'Untitled'
        },
        syntax: {
            type: DataTypes.STRING(50),
            allowNull: true,
            defaultValue: 'plaintext'
        },
        expiration_type: {
            type: DataTypes.STRING(20),
            allowNull: false,
            defaultValue: EXPIRATION_TYPES.NEVER,
            validate: {
                isIn: {
                    args: [Object.values(EXPIRATION_TYPES)],
                    msg: 'Invalid expiration type'
                }
            }
        },
        expires_at: {
            type: DataTypes.DATE,
            allowNull: true
        },
        max_views: {
            type: DataTypes.INTEGER,
            allowNull: true,
            validate: {
                min: {
                    args: [1],
                    msg: 'Max views must be at least 1'
                }
            }
        },
        view_count: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        updated_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        }
    },
    {
        sequelize,
        modelName: 'Paste',
        tableName: 'pastes',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        indexes: [
            {
                fields: ['expires_at']
            },
            {
                fields: ['created_at']
            }
        ]
    }
);

module.exports = Paste;
