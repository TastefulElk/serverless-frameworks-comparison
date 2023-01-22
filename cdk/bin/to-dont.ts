#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { ToDontStack } from '../lib/to-dont-stack';

const app = new cdk.App();
new ToDontStack(app, 'ToDontStack', {});