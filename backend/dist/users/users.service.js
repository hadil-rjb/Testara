"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const bcrypt = __importStar(require("bcrypt"));
const user_schema_1 = require("./schemas/user.schema");
const user_schema_2 = require("./schemas/user.schema");
let UsersService = class UsersService {
    constructor(userModel) {
        this.userModel = userModel;
    }
    async create(createUserDto) {
        const existing = await this.userModel.findOne({ email: createUserDto.email });
        if (existing) {
            throw new common_1.ConflictException('Un compte avec cet email existe déjà');
        }
        const hashedPassword = await bcrypt.hash(createUserDto.password, 12);
        const user = new this.userModel({
            ...createUserDto,
            password: hashedPassword,
        });
        return user.save();
    }
    async findByEmail(email) {
        return this.userModel.findOne({ email: email.toLowerCase() });
    }
    async findById(id) {
        const user = await this.userModel.findById(id);
        if (!user)
            throw new common_1.NotFoundException('Utilisateur non trouvé');
        return user;
    }
    async findOrCreateGoogleUser(profile) {
        let user = await this.userModel.findOne({ googleId: profile.googleId });
        if (!user) {
            user = await this.userModel.findOne({ email: profile.email });
            if (user) {
                user.googleId = profile.googleId;
                user.isGoogleUser = true;
                if (profile.avatar)
                    user.avatar = profile.avatar;
                await user.save();
            }
            else {
                user = await this.userModel.create({
                    ...profile,
                    isGoogleUser: true,
                });
            }
        }
        return user;
    }
    async update(id, updateUserDto) {
        const user = await this.userModel.findByIdAndUpdate(id, updateUserDto, { new: true });
        if (!user)
            throw new common_1.NotFoundException('Utilisateur non trouvé');
        return user;
    }
    async completeOnboarding(id, onboardingDto) {
        const user = await this.userModel.findByIdAndUpdate(id, {
            accountType: onboardingDto.accountType,
            companyName: onboardingDto.accountType === user_schema_2.AccountType.ENTERPRISE ? onboardingDto.companyName : undefined,
            onboardingCompleted: true,
        }, { new: true });
        if (!user)
            throw new common_1.NotFoundException('Utilisateur non trouvé');
        return user;
    }
    async setResetToken(email, token, expires) {
        const user = await this.findByEmail(email);
        if (!user)
            throw new common_1.NotFoundException('Utilisateur non trouvé');
        user.resetPasswordToken = token;
        user.resetPasswordExpires = expires;
        await user.save();
    }
    async resetPassword(token, newPassword) {
        const user = await this.userModel.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: new Date() },
        });
        if (!user)
            throw new common_1.NotFoundException('Token invalide ou expiré');
        user.password = await bcrypt.hash(newPassword, 12);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], UsersService);
//# sourceMappingURL=users.service.js.map